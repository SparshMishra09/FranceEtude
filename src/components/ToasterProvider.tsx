import { Toaster } from 'sonner@2.0.3';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      toastOptions={{
        style: {
          background: 'white',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
        },
      }}
    />
  );
}
