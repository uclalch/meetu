from .builder import ModelBuilder

class ModelDirector:
    def __init__(self, builder: ModelBuilder):
        self._builder = builder

    def create_basic_model(self) -> None:
        self._builder.reset()
        self._builder.set_parameters({
            "min_similarity": 0.3,
            "max_recommendations": 10
        })
        self._builder.set_features([
            "interests",
            "language_preference",
            "chat_activity"
        ])

    def create_advanced_model(self) -> None:
        self._builder.reset()
        self._builder.set_parameters({
            "min_similarity": 0.5,
            "max_recommendations": 20,
            "use_neural_network": True
        })
        self._builder.set_features([
            "interests",
            "language_preference",
            "chat_activity",
            "online_patterns",
            "message_content"
        ]) 