# Generated by Django 3.1.4 on 2020-12-29 20:20

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotify', '0005_auto_20201229_2107'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spotifytoken',
            name='access_token',
            field=models.CharField(default='', max_length=150),
        ),
        migrations.AlterField(
            model_name='spotifytoken',
            name='expires_in',
            field=models.DateTimeField(default=datetime.datetime(2020, 12, 29, 21, 20, 30, 30265)),
        ),
        migrations.AlterField(
            model_name='spotifytoken',
            name='refresh_token',
            field=models.CharField(default='', max_length=150),
        ),
        migrations.AlterField(
            model_name='spotifytoken',
            name='token_type',
            field=models.CharField(default='', max_length=50),
        ),
    ]
