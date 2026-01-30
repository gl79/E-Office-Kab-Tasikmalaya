import { useState, useCallback } from 'react';

interface UseCRUDModalOptions<T> {
    onOpenCreate?: () => void;
    onOpenEdit?: (item: T) => void;
    onOpenDelete?: (item: T) => void;
    onClose?: () => void;
}

interface UseCRUDModalReturn<T> {
    // Modal states
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;

    // Selected item for edit/delete
    selectedItem: T | null;

    // Actions
    openCreateModal: () => void;
    openEditModal: (item: T) => void;
    openDeleteModal: (item: T) => void;
    closeAllModals: () => void;
    closeCreateModal: () => void;
    closeEditModal: () => void;
    closeDeleteModal: () => void;
}

export function useCRUDModal<T>(options: UseCRUDModalOptions<T> = {}): UseCRUDModalReturn<T> {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    const openCreateModal = useCallback(() => {
        setSelectedItem(null);
        setIsCreateModalOpen(true);
        options.onOpenCreate?.();
    }, [options]);

    const openEditModal = useCallback((item: T) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
        options.onOpenEdit?.(item);
    }, [options]);

    const openDeleteModal = useCallback((item: T) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
        options.onOpenDelete?.(item);
    }, [options]);

    const closeCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
        setSelectedItem(null);
        options.onClose?.();
    }, [options]);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setSelectedItem(null);
        options.onClose?.();
    }, [options]);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        options.onClose?.();
    }, [options]);

    const closeAllModals = useCallback(() => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        options.onClose?.();
    }, [options]);

    return {
        isCreateModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        selectedItem,
        openCreateModal,
        openEditModal,
        openDeleteModal,
        closeAllModals,
        closeCreateModal,
        closeEditModal,
        closeDeleteModal,
    };
}

export default useCRUDModal;
