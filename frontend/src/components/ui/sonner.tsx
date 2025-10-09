import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'glass-toast',
          title: 'glass-toast-title',
          description: 'glass-toast-description',
          actionButton: 'glass-toast-action',
          cancelButton: 'glass-toast-cancel',
          closeButton: 'glass-toast-close',
          // Toast type specific styles
          success: 'glass-toast-success',
          error: 'glass-toast-error',
          warning: 'glass-toast-warning',
          info: 'glass-toast-info',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
