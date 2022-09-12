import { Test } from "@nestjs/testing";
import { AuthService } from './auth.service';
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        // Create a fake copy of UsersService
        const users: User[] = [];
        fakeUsersService = {
            find: (email:string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: Math.floor(Math.random() * 999999), email, password} as User;
                users.push(user);
                return Promise.resolve(user);
            }
        }
        const module = await Test.createTestingModule({
            providers: [AuthService,
            {
                provide: UsersService,
                useValue: fakeUsersService
            }
            ],
        }).compile();
    
        service = module.get(AuthService);
    });
    
    it('can create an instance of auth service', async () => {
        
    
        expect(service).toBeDefined();
    });

    it('creates a new user with salted and hashed password', async () => {
        const user = await service.signup('dovlas@test.com', 'dovlas123');

        expect(user.password).not.toEqual('dovlas123');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async (done) => {
        await service.signup('dovlas@test.com', 'dovlas123');
        try {
            
            await service.signup('dovlas@test.com', 'dovlas123');
        } catch (error) {
            done();
        }
    });

    it('throws if signin is called with an unused email', async (done) => {
        try {
            await service.signin('sfsa@dasdf.com', 'afdasfs');
        } catch (error) {
            done()
        }
    });

    it('throws if an invalid password is provided', async (done) => {
        await service.signup('njik@mkl.com', 'password1')
        try {
            await service.signin('njik@mkl.com', 'password');
        } catch (error) {
            done();
        }
    });

    it('returns a user if correct password is provided', async () => {
        await service.signup('asdfs@asf.com', 'mypassword');

        const user = await service.signin('asdfs@asf.com', 'mypassword');
        expect(user).toBeDefined();
    });
})

