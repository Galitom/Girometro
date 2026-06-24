from django.db import models


class Achievement(models.Model):
    slug = models.SlugField(primary_key=True, max_length=40)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=160)
    icon = models.CharField(max_length=30)  # lucide icon name
    got = models.BooleanField(default=False)
    date_label = models.CharField(max_length=20, blank=True)  # when unlocked
    progress = models.IntegerField(null=True, blank=True)
    target = models.IntegerField(null=True, blank=True)
    is_elo = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        app_label = 'api'
        ordering = ['order']

    def __str__(self):
        return self.name
