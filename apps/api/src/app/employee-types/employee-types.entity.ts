import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { User } from '../user';

@Entity()
export class EmployeeTypes {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	name: string;

	@Column()
	organizationId: string;

	@ManyToMany(
		(type) => Employee,
		(employee) => employee.employeeTypes
	)
	employees: Employee[];
}
