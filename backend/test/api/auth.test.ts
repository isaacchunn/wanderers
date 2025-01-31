import request from 'supertest';
import app from '../../index';
import { userFixture } from '../support/fixtures';

describe('Register User: POST /api/auth/register', () => {

    it('should return 400 if a field is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({})
            
        expect(res.body.message).toBe("Please provide name, username, email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if email is empty', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture({ email: ''}))
            
        expect(res.body.message).toBe("Please provide name, username, email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if password is empty', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture({ password: ''}))
            
        expect(res.body.message).toBe("Please provide name, username, email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if username is empty', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture({ username: ''}))
            
        expect(res.body.message).toBe("Please provide name, username, email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if name is empty', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture({ name: ''}))
            
        expect(res.body.message).toBe("Please provide name, username, email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if email is already registered', async () => {
        await request(app).post('/api/auth').send(userFixture({ email: 'hjk3412jj@gmail.com' }));
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture({email: 'hjk3412jj@gmail.com'}))
        
        expect(res.body.message).toBe("Email already exists");
        expect(res.status).toBe(400);
    });

    it('should return 400 if username is already registered', async () => {
        await request(app).post('/api/auth').send(userFixture({ username: 'duplicateusername' }));
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture({username: 'duplicateusername'}))

        expect(res.body.message).toBe("Username already exists");
        expect(res.status).toBe(400);
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userFixture())
            
        expect(res.body).toHaveProperty('token');
        expect(res.status).toBe(201);
    });
});

describe('Login User: POST /api/auth/login', () => {

    it('should return 400 if email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password' })
            
        expect(res.body.message).toBe("Please provide email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: '' })
            
        expect(res.body.message).toBe("Please provide email and password");
        expect(res.status).toBe(400);
    });

    it('should return 400 if invalid email or password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send(userFixture({email: 'notfounduser@gmail.com'}))
            
        expect(res.body.message).toBe("Invalid email or password");
        expect(res.status).toBe(400);
    })

    it('should return 201 if valid credentials', async () => {
        await request(app).post('/api/auth').send(userFixture({ email: 'loginuser@gmail.com', password: 'password' }));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'loginuser@gmail.com', password: 'password' })
        
        expect(res.body).toHaveProperty('token');
        expect(res.status).toBe(200);
    });
});

// describe('Request Confirmation Email: POST /api/auth/request-confirmation', () => {
//     it('should return 400 if email is missing', async () => {
//         const res = await request(app)
//             .post('/api/auth/request-confirmation')
//             .send({})
            
//         expect(res.body.message).toBe("Please provide email");
//         expect(res.status).toBe(400);
//     });

//     it('should return 400 if user not found', async () => {
//         const res = await request(app)
//             .post('/api/auth/request-confirmation')
//             .send({ email: '' })
            
//         expect(res.body.message).toBe("Please provide email");
//         expect(res.status).toBe(400);
//     })

//     it('should return 200 if email is found', async () => {
//         await request(app).post('/api/auth').send(userFixture({ email: 'asdfasdf@gmail.com' }));
//         const res = await request(app)
//             .post('/api/auth/request-confirmation')
//             .send({ email: 'asdfasdf@gmail.com' })
            
//         expect(res.body.message).toBe("User with provided email not found");
//         expect(res.status).toBe(400);
//     });
// });

// describe('Request Forget Password Email: POST /api/auth/forgotpassword', () => {
//     it('should return 400 if email is missing', async () => {
//         const res = await request(app)
//             .post('/api/auth/forgot-password')
//             .send({})
    
//         expect(res.body.message).toBe("Please provide email");
//         expect(res.status).toBe(400);
//     });

//     it('should return 200 if user not found', async () => {
//         const res = await request(app)
//             .post('/api/auth/forgot-password')
//             .send({ email: 'random@gmail.com' })
            
//         expect(res.body.message).toBe("Forget password email sent");
//         expect(res.status).toBe(200);
//     });

//     it('should return 200 if email is found', async () => {
//         await request(app).post('/api/auth').send(userFixture({ email: 'etgrajnhkl@gmail.com' }));
//         const res = await request(app)
//             .post('/api/auth/forgot-password')
//             .send({ email: 'etgrajnhkl@gmail.com' })
        
//         expect(res.body.message).toBe("Forget password email sent");
//         expect(res.status).toBe(200);
//     })
// });

// describe ('Confirm Account: GET /api/auth/confirmaccount/:token', () => {
//     it('should return 400 if token is invalid', async () => {
//         const res = await request(app)
//             .get('/api/auth/confirm-account/invalidtoken')
        
//         expect(res.body.message).toBe("Invalid token or expired");
//         expect(res.status).toBe(400);
//     });

//     it('should return 400 if token is expired', async () => {
//         const user = await User.create(userFixture());
//         const token = await UserToken.create({user_id: user.id, context: 'email_confirmation', token: 'expiredtoken', sent_to: user.email, createdAt: new Date(new Date().valueOf() - 24 * 60 * 60 * 1000), updatedAt: new Date()});
//         const res = await request(app)
//             .get(`/api/auth/confirm-account/${token}`)
            
//         expect(res.body.message).toBe("Invalid token or expired");
//         expect(res.status).toBe(400);
//     });

//     it('should return 200 if token is valid', async () => {
//         const user = await User.create(userFixture());
//         const token = await UserToken.create({user_id: user.id, context: 'email_confirmation', token: 'validtoken', sent_to: user.email, createdAt: new Date(new Date().valueOf() - 1 * 60 * 60 * 1000), updatedAt: new Date()});
//         const res = await request(app)
//             .get(`/api/auth/confirm-account/${token.token}`)
            
//         expect(res.body.message).toBe("Account confirmed");
//         expect(res.status).toBe(200);
//     });
// });

// describe('Reset Password: POST /api/auth/resetpassword/:token', () => {
//     it('should return 400 if token is invalid', async () => {
//         const res = await request(app)
//             .post('/api/auth/reset-password/invalidtoken')
//             .send({ password: 'newpassword' })
            
//         expect(res.body.message).toBe("Invalid token or expired");
//         expect(res.status).toBe(400);
//     });

//     it('should return 400 if token is expired', async () => {
//         const user = await User.create(userFixture());
//         const token = await UserToken.create({user_id: user.id, context: 'reset_password', token: 'expiredtoken', sent_to: user.email, createdAt: new Date(new Date().valueOf() - 24 * 60 * 60 * 1000), updatedAt: new Date()});
//         const res = await request(app)
//             .post(`/api/auth/reset-password/${token.token}`)
//             .send({ password: 'newpassword' })
            
//         expect(res.body.message).toBe("Invalid token or expired");
//         expect(res.status).toBe(400);
//     });

//     it('should return 200 if token is valid', async () => {
//         const user = await User.create(userFixture());
//         const token = await UserToken.create({user_id: user.id, context: 'reset_password', token: 'validtoken', sent_to: user.email, createdAt: new Date(new Date().valueOf() - 1 * 60 * 60 * 1000), updatedAt: new Date()});
//         const res = await request(app)
//             .post(`/api/auth/reset-password/${token.token}`)
//             .send({ password: 'newpassword' })
            
//         expect(res.body.message).toBe("Password updated");
//         expect(res.status).toBe(200);
//     });
// });