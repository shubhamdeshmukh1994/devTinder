
#DevTinderApi

AuthRouter
- Post /SignUp
- Post /Login
- Post /logout

Profile Router
- Get /profile/view
- Patch /profile/edit
- Patch /profile/password

connectionRequestRouter
- Post /request/send/interested/:userId
- Post /request/send/ignored/:userId
- Post /request/send/accepted/:userId
- Post /request/send/rejected/:userId

User Router
- Get /user/connection
- Get /user/request
- Get /user/feed