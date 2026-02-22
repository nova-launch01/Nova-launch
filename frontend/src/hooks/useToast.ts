import { useToastContext } from '../providers/ToastProvider';

export function useToast() {
    return useToastContext();
}
