/**
 * Modelo de usuário
 */
export class User {
    public id: number;
    public name: string;
    public email: string;
    public createdAt: Date;

    constructor(id: number, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }

    /**
     * Retorna uma representação em string do usuário
     */
    toString(): string {
        return `User(id=${this.id}, name=${this.name}, email=${this.email})`;
    }

    /**
     * Valida se o email tem um formato válido
     */
    isEmailValid(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    /**
     * Retorna a idade em dias desde a criação
     */
    getAgeInDays(): number {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}