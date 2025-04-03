from rest_framework import serializers
from .models import State, County, Disaster, Hospital, Resource

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'
        
class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class DisasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disaster
        fields = '__all__'

class CountySerializer(serializers.ModelSerializer):
    disasters = DisasterSerializer(many=True, read_only=True)
    hospitals = HospitalSerializer(many=True, read_only=True)

    class Meta:
        model = County
        fields = '__all__'

class StateSerializer(serializers.ModelSerializer):
    counties = CountySerializer(many=True, read_only=True)

    class Meta:
        model = State
        fields = '__all__'
