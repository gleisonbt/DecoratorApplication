import { User } from '../models/User';

/**
 * Serviço para gerenciamento de usuários
 */
export class UserService {
    private users: User[] = [];

    /**
     * Adiciona um novo usuário
     */
    addUser(user: User): void {
        if (!user.isEmailValid()) {
            throw new Error('Email inválido');
        }
        
        if (this.getUserByEmail(user.email)) {
            throw new Error('Usuário com este email já existe');
        }

        this.users.push(user);
        console.log(`✅ Usuário ${user.name} adicionado com sucesso!`);
    }

    /**
     * Remove um usuário pelo ID
     */
    removeUser(id: number): boolean {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            const removedUser = this.users.splice(index, 1)[0];
            console.log(`🗑️ Usuário ${removedUser.name} removido!`);
            return true;
        }
        return false;
    }

    /**
     * Busca um usuário pelo ID
     */
    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    /**
     * Busca um usuário pelo email
     */
    getUserByEmail(email: string): User | undefined {
        return this.users.find(user => user.email === email);
    }

    /**
     * Retorna todos os usuários
     */
    getAllUsers(): User[] {
        return [...this.users]; // Retorna uma cópia para evitar modificações externas
    }

    /**
     * Retorna a quantidade total de usuários
     */
    getUserCount(): number {
        return this.users.length;
    }

    /**
     * Atualiza um usuário existente
     */
    updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): boolean {
        const user = this.getUserById(id);
        if (!user) {
            return false;
        }

        if (updates.name) {
            user.name = updates.name;
        }
        
        if (updates.email) {
            if (!user.isEmailValid()) {
                throw new Error('Email inválido');
            }
            user.email = updates.email;
        }

        console.log(`📝 Usuário ${user.name} atualizado!`);
        return true;
    }
}