# Generated by Django 3.1.4 on 2020-12-29 20:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotify', '0006_auto_20201229_2120'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spotifytoken',
            name='access_token',
            field=models.CharField(max_length=150),
        ),
        migrations.AlterField(
            model_name='spotifytoken',
            name='expires_in',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='spotifytoken',
            name='refresh_token',
            field=models.CharField(max_length=150),
        ),
        migrations.AlterField(
            model_name='spotifytoken',
            name='token_type',
            field=models.CharField(max_length=50),
        ),
    ]
