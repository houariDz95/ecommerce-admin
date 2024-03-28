"use client"
import { Dialog,
    DialogContent,
     DialogHeader,
     DialogDescription,
      DialogTitle
   } from './dialog';

interface ModalProps {
    title: string;
    descreption: string;
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    title,
    descreption,
    isOpen,
    onClose,
    children
}) => {

    const onChange = (open: Boolean) => {
        if(!open){
            onClose();
        }
    }
  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {title}
                </DialogTitle>
                <DialogDescription>
                    {descreption}
                </DialogDescription>
                <div>
                    {children}
                </div>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}
