from django.contrib import admin
from .models import Expense, Trip, Day, Place

admin.site.register(Trip)
admin.site.register(Day)
admin.site.register(Place)
admin.site.register(Expense)