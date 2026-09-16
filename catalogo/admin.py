from django.contrib import admin
from .models import Libro, Cliente, Pedido, DetallePedido

admin.site.register(Libro)
admin.site.register(Cliente)
admin.site.register(Pedido)
admin.site.register(DetallePedido)
