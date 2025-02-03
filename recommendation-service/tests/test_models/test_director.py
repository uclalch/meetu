import pytest
from src.models.director import ModelDirector
from src.models.builder import ContentBasedBuilder

def test_director_basic_model():
    """
    Test creation of basic model configuration
    Expected:
    - Model has basic parameters set
    - Features list contains basic features
    Potential Issues:
    - Missing default values
    - Incorrect parameter types
    """
    builder = ContentBasedBuilder()
    director = ModelDirector(builder)
    director.create_basic_model()
    model = builder.build()
    
    assert model.get_parameters()["min_similarity"] == 0.3
    assert "interests" in model.get_features()

def test_director_advanced_model():
    """
    Test creation of advanced model configuration
    Expected:
    - Model has advanced parameters set
    - Extended feature list is present
    Potential Issues:
    - Resource requirements for advanced features
    - Compatibility issues with basic features
    """
    builder = ContentBasedBuilder()
    director = ModelDirector(builder)
    director.create_advanced_model()
    model = builder.build()
    
    assert model.get_parameters()["use_neural_network"] == True
    assert "message_content" in model.get_features() 