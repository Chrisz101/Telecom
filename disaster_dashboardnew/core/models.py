from django.db import models

class State(models.Model):
    name = models.CharField(max_length=100)
    disaster_count = models.IntegerField(default=0)
    boundary_coords = models.JSONField()  # Polygon coordinates for Google Maps

    def __str__(self):
        return self.name

class County(models.Model):
    state = models.ForeignKey(State, related_name='counties', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    disaster_intensity = models.IntegerField(default=0)
    population = models.IntegerField()
    boundary_coords = models.JSONField()  # Polygon coordinates

    def __str__(self):
        return f"{self.name} ({self.state.name})"

class Disaster(models.Model):
    county = models.ForeignKey(County, related_name='disasters', on_delete=models.CASCADE)
    disaster_type = models.CharField(max_length=100)
    severity = models.IntegerField()

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    beds_available = models.IntegerField()
    staff_available = models.IntegerField()
    medicines_available = models.IntegerField()
    county = models.CharField(max_length=255)  # could later be a ForeignKey to a County model
    def __str__(self):
        return self.name

class Resource(models.Model):
    hospital = models.ForeignKey(Hospital, related_name='resources', on_delete=models.CASCADE)
    beds_available = models.IntegerField()
    beds_needed = models.IntegerField()
    staff_available = models.IntegerField()
    staff_needed = models.IntegerField()
    medicines_available = models.IntegerField()
    medicines_needed = models.IntegerField()
