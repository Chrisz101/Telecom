from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import State, County, Disaster, Hospital, Resource
from .serializers import StateSerializer, CountySerializer, DisasterSerializer, HospitalSerializer, ResourceSerializer

class StateViewSet(viewsets.ModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer

class CountyViewSet(viewsets.ModelViewSet):
    queryset = County.objects.all()
    serializer_class = CountySerializer

class DisasterViewSet(viewsets.ModelViewSet):
    queryset = Disaster.objects.all()
    serializer_class = DisasterSerializer

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

    @action(detail=True, methods=['get'], url_path='details')
    def details(self, request, pk=None):
        hospital = self.get_object()
        data = {
            "id": hospital.id,
            "name": hospital.name,
            "lat": hospital.latitude,
            "lng": hospital.longitude,
            "resources": {
                "beds": {"available": hospital.beds_available, "needed": hospital.beds_needed},
                "staff": {"available": hospital.staff_available, "needed": hospital.staff_needed},
                "medicines": {"available": hospital.medicines_available, "needed": hospital.medicines_needed},
            },
            "nearbyCounties": hospital.nearby_counties.split(",") if hospital.nearby_counties else []
        }
        return Response(data)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
