/* eslint-disable @next/next/no-img-element */
'use client';

import { Edit3, Plus, Scissors, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    createService,
    deleteService,
    getServicesByBarbershop,
    updateService,
} from '@/actions/manage-services';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboardSession } from '@/lib/use-dashboard-session';

interface Service {
    id: string;
    name: string;
    description: string;
    priceInCents: number;
    durationMinutes: number;
    status: 'ACTIVE' | 'INACTIVE';
    imageUrl?: string;
}

const serviceImageOptions = [
    'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',
    'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',
    'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png',
    'https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png',
    'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png',
];

const defaultFormState = {
    name: '',
    description: '',
    price: '',
    duration: '60',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    imageUrl: '',
};

export function ServicesSection() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formState, setFormState] = useState(defaultFormState);

    const { user } = useDashboardSession();
    const barbershopId = typeof window !== 'undefined' ? localStorage.getItem('barbershopId') : null;
    const isEmployee = user?.role === 'EMPLOYEE';

    const loadServices = async () => {
        if (!barbershopId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await getServicesByBarbershop(barbershopId);
            setServices(data);
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            toast.error('Erro ao carregar serviços');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barbershopId]);

    const openNewServiceDialog = () => {
        setEditingService(null);
        setFormState(defaultFormState);
        setIsDialogOpen(true);
    };

    const openEditDialog = (service: Service) => {
        setEditingService(service);
        setFormState({
            name: service.name,
            description: service.description,
            price: (service.priceInCents / 100).toFixed(2),
            duration: String(service.durationMinutes),
            status: service.status,
            imageUrl: service.imageUrl || '',
        });
        setIsDialogOpen(true);
    };

    const handleFormChange = (field: keyof typeof formState, value: string) => {
        setFormState((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSaveService = async () => {
        if (!barbershopId) {
            toast.error('ID da barbearia não encontrado');
            return;
        }

        const name = formState.name.trim();
        const description = formState.description.trim();
        const price = Number(formState.price.replace(',', '.'));
        const durationMinutes = Number(formState.duration);
        const status = formState.status as 'ACTIVE' | 'INACTIVE';

        if (!name) {
            toast.error('Informe o nome do serviço');
            return;
        }

        if (!description) {
            toast.error('Informe a descrição do serviço');
            return;
        }

        if (Number.isNaN(price) || price < 0) {
            toast.error('Informe um preço válido');
            return;
        }

        if (!Number.isInteger(durationMinutes) || durationMinutes < 1) {
            toast.error('Informe duração em minutos válida');
            return;
        }

        const payload = {
            name,
            description,
            priceInCents: Math.round(price * 100),
            durationMinutes,
            status,
            imageUrl: formState.imageUrl.trim(),
            barbershopId,
        };

        try {
            setIsSaving(true);

            if (editingService) {
                await updateService({
                    id: editingService.id,
                    ...payload,
                });
                toast.success('Serviço atualizado com sucesso');
            } else {
                await createService(payload);
                toast.success('Serviço cadastrado com sucesso');
            }

            setIsDialogOpen(false);
            setEditingService(null);
            setFormState(defaultFormState);
            await loadServices();
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            toast.error('Não foi possível salvar o serviço');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteService = async () => {
        if (!barbershopId || !serviceToDelete) {
            return;
        }

        try {
            await deleteService({
                id: serviceToDelete.id,
                barbershopId,
            });
            toast.success('Serviço removido com sucesso');
            setServiceToDelete(null);
            setIsDeleteOpen(false);
            await loadServices();
        } catch (error) {
            console.error('Erro ao remover serviço:', error);
            toast.error('Não foi possível remover o serviço');
        }
    };

    const statusLabel = (status: Service['status']) => {
        if (status === 'ACTIVE') {
            return 'Ativo';
        }
        return 'Inativo';
    };

    const statusClasses = (status: Service['status']) =>
        status === 'ACTIVE'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-600';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Scissors className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Serviços</h1>
                            <p className="text-sm sm:text-base text-slate-500 mt-2">Gerencie os serviços da sua barbearia</p>
                        </div>
                    </div>
                </div>
                {!isEmployee && (
                    <Button
                        onClick={openNewServiceDialog}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo serviço
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="inline-block w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-600 font-medium">Carregando serviços...</p>
                    </div>
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <p className="text-slate-500 font-medium">Nenhum serviço cadastrado</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Imagem</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nome</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Descrição</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Preço</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Duração</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                    {!isEmployee && (
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Ações</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr
                                        key={service.id}
                                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            {service.imageUrl ? (
                                                <img
                                                    src={service.imageUrl}
                                                    alt={service.name}
                                                    className="h-12 w-20 rounded-lg object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="h-12 w-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
                                                    Sem imagem
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{service.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{service.description}</td>
                                        <td className="px-6 py-4 text-slate-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.priceInCents / 100)}</td>
                                        <td className="px-6 py-4 text-slate-700">{service.durationMinutes} min</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(service.status)}`}>
                                                {statusLabel(service.status)}
                                            </span>
                                        </td>
                                        {!isEmployee && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(service)}
                                                        className="border-slate-300 hover:bg-blue-50 text-blue-600"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setServiceToDelete(service);
                                                            setIsDeleteOpen(true);
                                                        }}
                                                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="md:hidden p-4 space-y-4">
                        {services.map((service) => (
                            <div key={service.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                        {service.imageUrl ? (
                                            <img
                                                src={service.imageUrl}
                                                alt={service.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-500">
                                                Sem imagem
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-base font-semibold text-slate-900">{service.name}</p>
                                                <p className="mt-1 text-sm leading-5 text-slate-600">{service.description}</p>
                                            </div>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses(service.status)}`}>
                                                {statusLabel(service.status)}
                                            </span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-700">
                                            <div>
                                                <span className="font-semibold text-slate-900">Preço</span>
                                                <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.priceInCents / 100)}</p>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-900">Duração</span>
                                                <p>{service.durationMinutes} min</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!isEmployee && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(service)}
                                            className="border-slate-300 hover:bg-blue-50 text-blue-600 flex-1"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            <span className="ml-2">Editar</span>
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                setServiceToDelete(service);
                                                setIsDeleteOpen(true);
                                            }}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex-1"
                                        >
                                            <Trash className="w-4 h-4" />
                                            <span className="ml-2">Remover</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-screen overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingService ? 'Editar serviço' : 'Cadastrar serviço'}</DialogTitle>
                        <DialogDescription>
                            Informe nome, descrição, preço, duração e status do serviço.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">Nome</Label>
                            <Input
                                value={formState.name}
                                onChange={(event) => handleFormChange('name', event.target.value)}
                                placeholder="Ex: Corte de Cabelo"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">Descrição</Label>
                            <textarea
                                value={formState.description}
                                onChange={(event) => handleFormChange('description', event.target.value)}
                                className="min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                                placeholder="Descreva o serviço"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-slate-700 font-semibold mb-2 block">Preço</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formState.price}
                                    onChange={(event) => handleFormChange('price', event.target.value)}
                                    placeholder="Ex: 60.00"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 font-semibold mb-2 block">Duração (min)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formState.duration}
                                    onChange={(event) => handleFormChange('duration', event.target.value)}
                                    placeholder="60"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 font-semibold mb-2 block">Status</Label>
                                <select
                                    value={formState.status}
                                    onChange={(event) => handleFormChange('status', event.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                                >
                                    <option value="ACTIVE">Ativo</option>
                                    <option value="INACTIVE">Inativo</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-700 font-semibold mb-2 block">Imagem do serviço</Label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {serviceImageOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleFormChange('imageUrl', option)}
                                        className={`rounded border p-1 transition-all ${formState.imageUrl === option ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-300'}`}
                                    >

                                        <img
                                            src={option}
                                            alt="Opção de imagem de serviço"
                                            className="h-16 w-full object-cover rounded"
                                        />
                                    </button>
                                ))}
                            </div>
                            <Input
                                value={formState.imageUrl}
                                onChange={(event) => handleFormChange('imageUrl', event.target.value)}
                                placeholder="Cole a URL da imagem do serviço"
                            />
                            {formState.imageUrl && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                    <img
                                        src={formState.imageUrl}
                                        alt="Prévia da imagem do serviço"
                                        className="w-full h-36 object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveService} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : editingService ? 'Salvar alterações' : 'Cadastrar serviço'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover serviço</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este serviço? Essa ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteService}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
