import { render, screen, fireEvent } from '@testing-library/react';
import ClienteForm from '@/app/components/ClienteForm';describe('ClienteForm', () => {
    it('renderiza los campos de nombre y email', () => {
        render(
            <ClienteForm
                onGuardado={() => {}}
                onCancelar={() => {}}
            />
        );

        expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    it('muestra el botón Guardar y Cancelar', () => {
        render(
            <ClienteForm
                onGuardado={() => {}}
                onCancelar={() => {}}
            />
        );

        expect(screen.getByText('Guardar')).toBeInTheDocument();
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('llama a onCancelar cuando se hace clic en Cancelar', () => {
        const onCancelar = jest.fn();

        render(
            <ClienteForm
                onGuardado={() => {}}
                onCancelar={onCancelar}
            />
        );

        fireEvent.click(screen.getByText('Cancelar'));
        expect(onCancelar).toHaveBeenCalledTimes(1);
    });
});