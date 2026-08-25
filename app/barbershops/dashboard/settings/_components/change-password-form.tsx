'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { changeDashboardPassword } from '@/actions/change-dashboard-password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const changePasswordFormSchema = z.object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não correspondem',
    path: ['confirmPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const { execute, isPending } = useAction(changeDashboardPassword, {
        onSuccess: (result) => {
            if (result.data?.success) {
                toast.success('Senha alterada com sucesso!');
                reset();
            }
        },
        onError: (result) => {
            const message =
                result.error?.validationErrors?._errors?.[0] ??
                result.error?.serverError ??
                'Não foi possível alterar a senha.';

            toast.error(message);
        },
    });

    const onSubmit = async (data: ChangePasswordFormData) => {
        await execute(data);
    };

    return (
            <div className="space-y-4">
            <div>
                <Label className="mb-2 block font-semibold text-slate-700">Senha atual</Label>
                <Input {...register('currentPassword')} type="password" autoComplete="current-password" />
                {errors.currentPassword && <p className="mt-1 text-sm text-red-500">{errors.currentPassword.message}</p>}
            </div>
            <div>
                <Label className="mb-2 block font-semibold text-slate-700">Nova senha</Label>
                <Input {...register('newPassword')} type="password" autoComplete="new-password" />
                {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>}
            </div>
            <div>
                <Label className="mb-2 block font-semibold text-slate-700">Confirmar nova senha</Label>
                <Input {...register('confirmPassword')} type="password" autoComplete="new-password" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
                <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending} className="w-full sm:w-auto">
                {isPending ? 'Alterando...' : 'Alterar senha'}
            </Button>
            </div>
    );
}
