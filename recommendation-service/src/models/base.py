from abc import ABC, abstractmethod
from typing import List, Dict, Any

class RecommenderModel(ABC):
    @abstractmethod
    def train(self, data: Any) -> None:
        pass

    @abstractmethod
    def predict(self, user_id: str, n_recommendations: int = 10) -> List[Dict]:
        pass

    @abstractmethod
    def update(self, new_data: Any) -> None:
        pass 