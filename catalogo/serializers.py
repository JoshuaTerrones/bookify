from rest_framework import serializers
from .models import Libro, Cliente, Pedido, DetallePedido


class LibroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Libro
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class DetallePedidoSerializer(serializers.ModelSerializer):
    libro_titulo = serializers.CharField(source='libro.titulo', read_only=True)

    class Meta:
        model = DetallePedido
        fields = ['id', 'libro', 'libro_titulo', 'cantidad']

class PedidoSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    detalles = DetallePedidoSerializer(many=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'cliente_nombre', 'fecha', 'detalles']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        pedido = Pedido.objects.create(**validated_data)
        for detalle_data in detalles_data:
            DetallePedido.objects.create(pedido=pedido, **detalle_data)
        return pedido

    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)
        instance.cliente = validated_data.get('cliente', instance.cliente)
        instance.save()
        if detalles_data is not None:
            instance.detalles.all().delete()
            for detalle_data in detalles_data:
                DetallePedido.objects.create(pedido=instance, **detalle_data)
        return instance