// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersService } from './users.service';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { getLoggerToken, LoggerModule } from 'nestjs-pino';
// import { PrismaModule } from 'src/prisma/prisma.module';
// import { NotFoundException } from '@nestjs/common';

// const mockPinoLogger = {
//   info: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
//   debug: jest.fn(),
// };

// describe('UsersService', () => {
//   let service: UsersService;
//   const mockPrismaService = {
//     user: {
//       create: jest.fn(),
//       findUnique: jest.fn(),
//       findMany: jest.fn(),
//       update: jest.fn(),
//       delete: jest.fn(),
//       count: jest.fn(),
//     },
//     $transaction: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [LoggerModule.forRoot(), PrismaModule],
//       providers: [
//         UsersService,
//         {
//           provide: getLoggerToken(UsersService.name),
//           useValue: mockPinoLogger,
//         },
//         {
//           provide: PrismaService,
//           useValue: mockPrismaService,
//         },
//       ],
//     })
//       .overrideProvider(PrismaService)
//       .useValue(mockPrismaService)
//       .compile();

//     service = module.get<UsersService>(UsersService);

//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('when create user', () => {
//     const createUserDto = {
//       id: 1,
//       email: 'test@example.com',
//       username: 'testuser',
//       password: 'password123',
//     };

//     const expectedUser = {
//       id: 1,
//       email: 'test@example.com',
//       username: 'testuser',
//     };

//     it('should create a user successfully', async () => {
//       mockPrismaService.user.create.mockResolvedValue(expectedUser);

//       const result = await service.create(createUserDto);

//       expect(mockPinoLogger.info).toHaveBeenCalledWith('Create user');
//       expect(mockPrismaService.user.create).toHaveBeenCalled();
//       expect(result).toEqual(expectedUser);
//     });
//   });

//   describe('when get all users', () => {
//     const query = {
//       page: 1,
//       size: 10,
//       email: 'test',
//       username: 'user',
//     };

//     const users = [
//       { id: 1, email: 'test1@example.com', username: 'user1' },
//       { id: 2, email: 'test2@example.com', username: 'user2' },
//     ];

//     it('should return paginated users', async () => {
//       mockPrismaService.$transaction.mockResolvedValue([users, 2]);

//       const result = await service.findAll(query);

//       expect(mockPinoLogger.info).toHaveBeenCalledWith('Get all users');
//       expect(mockPrismaService.$transaction).toHaveBeenCalled();
//       expect(result).toEqual({
//         data: users,
//         meta: {
//           total: 2,
//           lastPage: 1,
//           currentPage: 1,
//           totalPerPage: 10,
//           prevPage: null,
//           nextPage: null,
//         },
//       });
//     });
//   });

//   describe('when get user by id', () => {
//     const userId = 1;
//     const user = {
//       id: userId,
//       email: 'test@example.com',
//       username: 'testuser',
//     };

//     it('should return user', async () => {
//       mockPrismaService.user.findUnique.mockResolvedValue(user);

//       const result = await service.findOne(userId);

//       expect(mockPinoLogger.info).toHaveBeenCalledWith(
//         `Get user with id: ${userId}`,
//       );
//       expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
//         where: { id: userId },
//         select: { id: true, email: true, username: true },
//       });
//       expect(result).toEqual(user);
//     });
//     it('should throw NotFoundException if user not found', async () => {
//       mockPrismaService.user.findUnique.mockResolvedValue(null);

//       await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
//       expect(mockPinoLogger.info).toHaveBeenCalledWith(
//         `Get user with id: ${userId}`,
//       );
//     });
//   });

//   describe('when delete user', () => {
//     const userId = 1;
//     const user = {
//       id: userId,
//       email: 'test@example.com',
//       username: 'testuser',
//     };
//     it('should delete user', async () => {
//       mockPrismaService.user.findUnique.mockResolvedValue(user);
//       mockPrismaService.user.delete.mockResolvedValue(user);

//       const result = await service.remove(userId);

//       expect(mockPinoLogger.info).toHaveBeenCalledWith(
//         `Remove user with id: ${userId}`,
//       );
//       expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
//         where: { id: userId },
//       });
//       expect(result).toBe(true);
//     });
//     it('should throw NotFoundException if user not found', async () => {
//       mockPrismaService.user.findUnique.mockResolvedValue(null);

//       await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
//       expect(mockPinoLogger.info).toHaveBeenCalledWith(
//         `Remove user with id: ${userId}`,
//       );
//     });
//   });

//   describe('when update user', () => {
//     const userId = 1;
//     const updateUserDto = {
//       username: 'updateduser',
//       email: 'test@example.com',
//     };
//     const updatedUser = {
//       id: userId,
//       email: 'test@example.com',
//       username: 'updateduser',
//     };

//     it('should update a user successfully', async () => {
//       mockPrismaService.user.update.mockResolvedValue(updatedUser);

//       const result = await service.update(userId, updateUserDto);

//       expect(mockPinoLogger.info).toHaveBeenCalledWith(
//         `Update user with id: ${userId}`,
//       );
//       expect(mockPrismaService.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: updateUserDto,
//         select: { id: true, email: true, username: true },
//       });
//       expect(result).toEqual(updatedUser);
//     });
//   });
// });
