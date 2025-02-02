// /* eslint-disable @typescript-eslint/unbound-method */
// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { UserQueryDto } from './dto/user-query.dto';
// import { IUser } from './entities/user.entity';
// import { LoggerModule } from 'nestjs-pino';
// import { PrismaModule } from 'src/prisma/prisma.module';

// describe('UsersController', () => {
//   let controller: UsersController;
//   let service: UsersService;

//   const mockUsersService = {
//     create: jest.fn().mockImplementation((dto: CreateUserDto) =>
//       Promise.resolve({
//         id: 1,
//         email: dto.email,
//         username: dto.username,
//       }),
//     ),
//     findAll: jest.fn().mockImplementation((query: UserQueryDto) =>
//       Promise.resolve({
//         data: [],
//         meta: { total: 0, page: query.page, size: query.size, totalPages: 0 },
//       }),
//     ),
//     findOne: jest.fn().mockImplementation((id: number) =>
//       Promise.resolve({
//         id,
//         email: 'test@example.com',
//         username: 'testuser',
//       }),
//     ),
//     update: jest.fn().mockImplementation((id: number, dto: UpdateUserDto) =>
//       Promise.resolve({
//         id,
//         ...dto,
//       }),
//     ),
//     remove: jest.fn().mockImplementation(() => Promise.resolve(true)),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [LoggerModule.forRoot(), PrismaModule],
//       controllers: [UsersController],
//       providers: [
//         {
//           provide: UsersService,
//           useValue: mockUsersService,
//         },
//       ],
//     }).compile();

//     controller = module.get<UsersController>(UsersController);
//     service = module.get<UsersService>(UsersService);

//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('create', () => {
//     const createUserDto: CreateUserDto = {
//       id: 1,
//       email: 'test@example.com',
//       username: 'testuser',
//       password: 'password123',
//     };

//     const mockUser: IUser = {
//       id: 1,
//       email: 'test@example.com',
//       username: 'testuser',
//     };

//     it('should create a user successfully', async () => {
//       mockUsersService.create.mockResolvedValue(mockUser);

//       const result = await controller.create(createUserDto);

//       expect(service.create).toHaveBeenCalledWith(createUserDto);
//       expect(result).toEqual({
//         success: true,
//         meta: undefined,
//         statusCode: 201,
//         message: 'Success to create user',
//         data: mockUser,
//       });
//     });
//   });

//   describe('findAll', () => {
//     const query: UserQueryDto = {
//       page: 1,
//       size: 10,
//       email: 'test',
//       username: 'user',
//     };

//     const mockUsers: IUser[] = [
//       { id: 1, email: 'test1@example.com', username: 'user1' },
//       { id: 2, email: 'test2@example.com', username: 'user2' },
//     ];

//     const mockPaginatedResponse = {
//       data: mockUsers,
//       meta: {
//         total: 2,
//         lastPage: 1,
//         currentPage: 1,
//         totalPerPage: 10,
//         prevPage: null,
//         nextPage: null,
//       },
//     };

//     it('should return all users with pagination', async () => {
//       mockUsersService.findAll.mockResolvedValue(mockPaginatedResponse);

//       const result = await controller.findAll(query);

//       expect(service.findAll).toHaveBeenCalledWith(query);
//       expect(result).toEqual({
//         statusCode: 200,
//         message: 'Success to get all users',
//         data: mockUsers,
//         meta: mockPaginatedResponse.meta,
//         success: true,
//       });
//     });
//   });

//   describe('findOne', () => {
//     const userId = 1;
//     const mockUser: IUser = {
//       id: userId,
//       email: 'test@example.com',
//       username: 'testuser',
//     };

//     it('should return a single user', async () => {
//       mockUsersService.findOne.mockResolvedValue(mockUser);

//       const result = await controller.findOne(userId);

//       expect(service.findOne).toHaveBeenCalledWith(userId);
//       expect(result).toEqual({
//         statusCode: 200,
//         message: 'Success to get user',
//         data: mockUser,
//         success: true,
//         meta: undefined,
//       });
//     });
//   });

//   describe('update', () => {
//     const userId = 1;
//     const updateUserDto: UpdateUserDto = {
//       username: 'updateduser',
//       email: 'test@example.com',
//     };
//     const mockUpdatedUser: IUser = {
//       id: userId,
//       email: 'test@example.com',
//       username: 'updateduser',
//     };

//     it('should update a user successfully', async () => {
//       mockUsersService.update.mockResolvedValue(mockUpdatedUser);

//       const result = await controller.update(userId, updateUserDto);

//       expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
//       expect(result).toEqual({
//         statusCode: 200,
//         message: 'Success to update user',
//         data: mockUpdatedUser,
//         success: true,
//         meta: undefined,
//       });
//     });
//   });

//   describe('remove', () => {
//     const userId = 1;

//     it('should remove a user successfully', async () => {
//       mockUsersService.remove.mockResolvedValue(true);

//       const result = await controller.remove(userId);

//       expect(service.remove).toHaveBeenCalledWith(userId);
//       expect(result).toEqual({
//         statusCode: 200,
//         message: 'Success to remove user',
//         data: true,
//         success: true,
//         meta: undefined,
//       });
//     });
//   });

//   // Testing error scenarios
//   describe('error handling', () => {
//     it('should handle service errors in create', async () => {
//       const error = new Error('Create failed');
//       mockUsersService.create.mockRejectedValue(error);

//       await expect(
//         controller.create({
//           id: 1,
//           email: 'test@example.com',
//           username: 'testuser',
//           password: 'password123',
//         }),
//       ).rejects.toThrow(error);
//     });

//     it('should handle service errors in findOne', async () => {
//       const error = new Error('User not found');
//       mockUsersService.findOne.mockRejectedValue(error);

//       await expect(controller.findOne(999)).rejects.toThrow(error);
//     });

//     // Add more error handling tests as needed
//   });
// });
