import { useState } from "react";

// Buat custom hook sekali, pakai di semua form
export function useSubmitGuard() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const withGuard = async (fn) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await fn();
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, withGuard };
}