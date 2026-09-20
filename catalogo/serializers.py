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

    def validate(self, data):
        detalles = data.get('detalles', [])
        for detalle in detalles:
            libro = detalle['libro']
            cantidad = detalle['cantidad']
            if cantidad > libro.stock:
                raise serializers.ValidationError(
                    f"No hay stock suficiente de '{libro.titulo}'. "
                    f"Disponible: {libro.stock}, solicitado: {cantidad}."
                )
        return data

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        pedido = Pedido.objects.create(**validated_data)
        for detalle_data in detalles_data:
            libro = detalle_data['libro']
            cantidad = detalle_data['cantidad']
            libro.stock -= cantidad
            libro.save()
            DetallePedido.objects.create(pedido=pedido, **detalle_data)
        return pedido

    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)

        # Devolver el stock de los detalles anteriores antes de borrarlos
        if detalles_data is not None:
            for detalle_viejo in instance.detalles.all():
                detalle_viejo.libro.stock += detalle_viejo.cantidad
                detalle_viejo.libro.save()
            instance.detalles.all().delete()

            for detalle_data in detalles_data:
                libro = detalle_data['libro']
                cantidad = detalle_data['cantidad']
                libro.stock -= cantidad
                libro.save()
                DetallePedido.objects.create(pedido=instance, **detalle_data)

        instance.cliente = validated_data.get('cliente', instance.cliente)
        instance.save()
        return instance