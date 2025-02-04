# DevTinder API's

## authRouter
- POST / signup
- POST / login
- POST / logout

## profileRouter
- GET  / profile / view
- PATCH / profile / edit
- PATCH / profile / password

## connectionRequestRouter
- POST / request / send / :status/:userId
- POST /request /review/ :status/:requestId

## userRouter
- GET /user/connections
- GET /user/requests/received
- GET /user /feed -Gets you the profile of other users on platform

- Status : ignore , interested, accepted,reject

- indexing db
- compound index

- /feed?page=1&limit=10 => first 10 users 1-10 => .skip(0) & .limit(10)

- /feed?page=2&limit=10 => 11 - 20 => .skip(10) & .limit(10)

- /feed?page=3&limit=10 => 21 - 30 => .skip(20) & .limit(10)

-  skip = (page-1)*limit;
-  page=3,  (3-1)*10=2*10=20