import os
import joblib
import logging
from datetime import datetime
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.models import MLModel, MLTrainingRun, MLMetrics
from app.ml.dataset_builder import dataset_builder

logger = logging.getLogger(__name__)

class TrainingService:
    def __init__(self):
        self.models_dir = os.path.join(os.getcwd(), "ml_models")
        os.makedirs(self.models_dir, exist_ok=True)

    def _generate_slug(self, name: str) -> str:
        return "".join([c if c.isalnum() else "_" for c in name.lower()])

    def train_and_evaluate(
        self,
        X,
        y,
        model_type: str,
        is_classification: bool = True
    ) -> Tuple[RandomForestClassifier, Dict[str, float]]:
        """
        Splits data, trains a RandomForestClassifier, and computes classification metrics.
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest Classifier
        # Set max_depth/min_samples_leaf to prevent overfitting on small local datasets
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_leaf=2,
            random_state=42
        )
        model.fit(X_train, y_train)
        
        # Predictions
        preds = model.predict(X_test)
        
        # Metrics
        accuracy = float(accuracy_score(y_test, preds))
        
        # Multi-class handling for risk
        average_method = "weighted" if model_type == "risk" else "binary"
        
        precision = float(precision_score(y_test, preds, average=average_method, zero_division=0))
        recall = float(recall_score(y_test, preds, average=average_method, zero_division=0))
        f1 = float(f1_score(y_test, preds, average=average_method, zero_division=0))
        
        metrics = {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4)
        }
        
        return model, metrics

    async def train_models_for_city(
        self,
        db: Session,
        city_name: str,
        lat: float,
        lon: float,
        period_years: int = 2
    ) -> Dict[str, Any]:
        """
        Runs the full training workflow: dataset compilation, training 3 models,
        saving joblib binaries, and persisting records in SQL.
        """
        # 1. Create a training run log
        run = MLTrainingRun(
            city_name=city_name,
            status="running"
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        
        try:
            # 2. Build Dataset
            dataset = await dataset_builder.build_dataset(lat, lon, city_name, period_years)
            if not dataset:
                raise ValueError("Incapaz de extrair dados históricos suficientes para compilar o dataset.")
                
            X, y_rain, y_heavy, y_risk = dataset
            samples_count = len(X)
            
            # 3. Train models
            targets = {
                "rain": y_rain,
                "heavy_rain": y_heavy,
                "risk": y_risk
            }
            
            trained_results = {}
            feature_names = list(X.columns)
            city_slug = self._generate_slug(city_name)
            
            for m_type, y_target in targets.items():
                logger.info(f"Training model {m_type} for {city_name}")
                model, metrics = self.train_and_evaluate(X, y_target, m_type)
                
                # Save binary to disk
                file_name = f"{city_slug}_{m_type}.joblib"
                file_path = os.path.join(self.models_dir, file_name)
                joblib.dump(model, file_path)
                
                # Calculate feature importances
                importances = model.feature_importances_
                importance_list = [
                    {"feature": name, "importance": round(float(imp), 4)}
                    for name, imp in zip(feature_names, importances)
                ]
                # Sort descending
                importance_list.sort(key=lambda x: x["importance"], reverse=True)
                
                # Delete any old model record of the same type for this city
                db.query(MLModel).filter(
                    MLModel.city_name == city_name,
                    MLModel.model_type == m_type
                ).delete()
                
                # Save new model record
                db_model = MLModel(
                    city_name=city_name,
                    model_type=m_type,
                    algorithm="RandomForest",
                    file_path=file_path,
                    accuracy=metrics["accuracy"],
                    f1_score=metrics["f1"],
                    samples_count=samples_count
                )
                db.add(db_model)
                db.commit()
                db.refresh(db_model)
                
                # Save metrics relation
                for name, value in metrics.items():
                    db_metric = MLMetrics(
                        model_id=db_model.id,
                        metric_name=name,
                        metric_value=value
                    )
                    db.add(db_metric)
                
                trained_results[m_type] = {
                    "metrics": metrics,
                    "importances": importance_list[:10]  # top 10
                }
                
            # 4. Finalize run log
            run.status = "completed"
            run.finished_at = datetime.now()
            run.samples_used = samples_count
            db.commit()
            
            return {
                "status": "completed",
                "city_name": city_name,
                "models_trained": len(targets),
                "samples_used": samples_count,
                "results": trained_results,
                "training_run_id": run.id
            }
            
        except Exception as e:
            logger.exception(f"Training run failed for {city_name}")
            run.status = "failed"
            run.finished_at = datetime.now()
            run.error_message = str(e)
            db.commit()
            raise e

training_service = TrainingService()
