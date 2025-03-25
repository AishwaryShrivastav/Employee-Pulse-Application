import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersSeedService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async seed() {
    // Check if users already exist
    const existingUsers = await this.userModel.find().exec();
    if (existingUsers.length > 0) {
      console.log('Users already exist, skipping seed...');
      return existingUsers;
    }

    // Create admin user (combined Admin & HR role)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await this.userModel.create({
      name: 'Admin & HR Manager',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });

    // Create regular employees
    const employeePassword = await bcrypt.hash('employee123', 10);
    const employees = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'employee',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'employee',
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'employee',
      },
    ];

    const createdEmployees = await Promise.all(
      employees.map(employee =>
        this.userModel.create({
          ...employee,
          password: employeePassword,
        }),
      ),
    );

    const allUsers = [adminUser, ...createdEmployees];
    console.log('Seed data created successfully!');
    console.log('Admin & HR credentials: admin@example.com / admin123');
    console.log('Employee credentials: john@example.com / employee123');

    return allUsers;
  }
}
