import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { sendError, sendSuccess } from '../utils/responses.js';
import {
    ALREADYEXISTS,
    BADREQUEST,
    CREATED,
    FORBIDDEN,
    INTERNALERROR,
    NOTFOUND,
    OK,
    UNAUTHORIZED,
} from '../constants/httpStatus.js';
// import Users from '../models/register.js';
// import { PENDING } from '../constants/constants.js';
import {
    responseMessages,

} from '../constants/responseMessages.js';
import Users from '../models/Users.js';
import { GenerateToken, ValidateToken, VerifyToken } from '../helpers/token.js';
// import pkg from 'jsonwebtoken';

// const { verify, decode } = pkg;

// const {
//     GET_SUCCESS_MESSAGES,
//     INVITATION_LINK_UNSUCCESS,
//     MISSING_FIELDS,
//     MISSING_FIELD_EMAIL,
//     NO_USER,
//     NO_USER_FOUND,
//     PASSWORD_AND_CONFIRM_NO_MATCH,
//     PASSWORD_CHANGE,
//     PASSWORD_FAILED,
//     RESET_LINK_SUCCESS,
//     SUCCESS_REGISTRATION,
//     UN_AUTHORIZED,
//     USER_EXISTS,
//     USER_NAME_EXISTS
// } = responseMessages;

// @desc    SIGNUP
// @route   POST api/auth/signup
// @access  Public



export const signUp = async (req, res) => {
    console.log("signup controller")
    console.log(req.body, "===>>> req.body")
    try {
        const { firstName, lastName, userName, email, password, cPassword } =
            req.body;

        if (!firstName || !lastName || !userName || !email || !password || !cPassword) {
            return res
                .status(BADREQUEST) //BADREQUEST
                .send(sendError({ status: false, message: responseMessages.MISSING_FIELDS }));
            // .send("Missing Fields");
        }
        // const salt = genSaltSync(10);
        // const hashedPassword = hashSync(password, salt)
        // return res.send(hashedPassword)


        const user = await Users.findOne({ Email: email });
        if (user) {
            return res
                .status(ALREADYEXISTS)
                .send(sendError({ status: false, message: responseMessages.USER_EXISTS }));
        } else {
            const user = await Users.findOne({ UserName: userName });
            if (user) {
                return res
                    .status(ALREADYEXISTS)
                    .send(sendError({ status: false, message: responseMessages.USER_NAME_EXISTS }));
            } else {
                const salt = genSaltSync(10);
                let doc;

                if (password?.length > 7) {
                    doc = new Users({
                        FirstName: firstName,
                        LastName: lastName,
                        Email: email,
                        UserName: userName,
                        Password: hashSync(password, salt),
                    });

                    let savedUser = await doc.save();
                    if (savedUser.errors) {
                        return res
                            .status(INTERNALERROR)
                            .send(sendError({ status: false, message: error.message, error }));
                    } else {
                        // return res.send(savedUser);
                        savedUser.Password = undefined;
                        const token = sign({ result: data }, process.env.JWT_SECRET_KEY, {
                            expiresIn: expiresIn,
                        });
                        return res.status(CREATED).send(
                            sendSuccess({
                                status: true,
                                message: responseMessages.SUCCESS_REGISTRATION,
                                token,
                                data: savedUser,
                            })
                        );
                    }
                } else {
                    return res
                        .status(FORBIDDEN)
                        .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
                }
            }
        }
    } catch (error) {
        // console.log(error.message, "====>>>error")
        return res
            .status(500) //INTERNALERROR
            // .send(sendError({ status: false, message: error.message, error }));
            .send(error.message);
    }
};

// @desc    LOGIN
// @route   GET api/auth/login
// @access  Public

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email && password) {
            // return res.send("login controller")

            let user = await Users.findOne({ Email: email });
            console.log(user);
            if (user) {
                const isValid = compareSync(password, user.Password);
                if (user.Email === email && isValid) {
                    user.Password = undefined;
                    const token = GenerateToken({ data: user, expiresIn: '24h' });
                    res.status(OK).send(
                        sendSuccess({
                            status: true,
                            message: 'Login Successful',
                            token,
                            data: user,
                        })
                    );
                } else {
                    return res
                        .status(OK)
                        .send(sendError({ status: false, message: responseMessages.UN_AUTHORIZED }));
                }
            } else {
                return res
                    .status(NOTFOUND)
                    .send(sendError({ status: false, message: responseMessages.NO_USER }));
            }
        } else {
            return res
                .status(500) //BADREQUEST
                // .send(sendError({ status: false, message: MISSING_FIELDS }));
                .send("Missing fields");
        }
    } catch (error) {
        return res.status(500)   //INTERNALERROR
            .send(error.message)
        // .send(
        //     sendError({
        //         status: false,
        //         message: error.message,
        //         data: null,
        //     })
        // );
    }
};

// @desc    RefreshToken
// @route   GET api/auth/refreshToken
// @access  Public

// export const refreshToken = async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (token) {
//       // Decode Token
//       const { result } = decode(token);
//       let user = result;
//       if (user) {
//         if (!user.IsActivate) {
//           return res.status(OK).send(
//             sendSuccess({
//               status: true,
//               message:
//                 'User is deactivated, sign up again from a different email address',
//               data: user,
//             })
//           );
//         }
//         // generate new token
//         const newToken = GenerateToken({ data: user, expiresIn: '1m' });
//         res.status(OK).send(
//           sendSuccess({
//             status: true,
//             message: 'Refresh Token Generated',
//             token: newToken,
//           })
//         );
//       } else {
//         return res
//           .status(NOTFOUND)
//           .send(sendError({ status: false, message: NO_USER }));
//       }
//     } else {
//       return res
//         .status(BADREQUEST)
//         .send(sendError({ status: false, message: MISSING_FIELDS }));
//     }
//   } catch (error) {
//     return res.status(401).send({
//       status: 'failed',
//       message: 'Unauthorized User, Not A Valid Token',
//     });
//   }
// };

// @desc    CHANGEPASSWORD
// @route   PUT api/auth/changePassword
// @access  Private

// export const changePassword = async (req, res) => {
//   const userDetails = req.user;
//   try {
//     const user = await Users.findOne({
//       'Authentication.Email': userDetails.Authentication.Email,
//     });
//     const { password, confirmPassword } = req.body;
//     if (password && confirmPassword) {
//       if (password !== confirmPassword) {
//         return res
//           .status(BADREQUEST)
//           .send(
//             sendError({ status: false, message: PASSWORD_AND_CONFIRM_NO_MATCH })
//           );
//       } else {
//         const salt = genSaltSync(10);
//         const newPassword = hashSync(password, salt);
//         const isValid = compareSync(password, user.Authentication.Password);
//         if (isValid) {
//           return res.status(OK).send(
//             sendSuccess({
//               status: false,
//               message: PASSWORD_FAILED,
//               data: null,
//             })
//           );
//         }
//         await Users.findByIdAndUpdate(req.user._id, {
//           $set: { 'Authentication.Password': newPassword },
//         });
//         return res
//           .status(OK)
//           .send(
//             sendSuccess({ status: true, message: PASSWORD_CHANGE, data: null })
//           );
//       }
//     } else {
//       return res
//         .status(BADREQUEST)
//         .send(sendError({ status: false, message: MISSING_FIELDS }));
//     }
//   } catch (error) {
//     return res.status(INTERNALERROR).send(
//       sendError({
//         status: false,
//         message: error.message,
//         data: null,
//       })
//     );
//   }
// };

// @desc    Get Logged In User details
// @route   GET api/auth/userInfo
// @access  Private

// export const loggedInUser = async (req, res) => {
//   try {
//     return res.status(OK).send(
//       sendSuccess({
//         status: true,
//         message: GET_SUCCESS_MESSAGES,
//         data: req.user,
//       })
//     );
//   } catch (error) {
//     return res.status(INTERNALERROR).send(
//       sendError({
//         status: false,
//         message: error.message,
//         data: null,
//       })
//     );
//   }
// };

// @desc    Send Reset Password Email
// @route   POST api/auth/resetPasswordRequest
// @access  Public

// export const sendReset = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (email) {
//       const user = await Users.findOne({ 'Authentication.Email': email });
//       if (user) {
//         const secret = user._id + process.env.JWT_SECRET_KEY;
//         const token = GenerateToken({ data: secret, expiresIn: '30m' });
//         const link = `${process.env.WEB_LINK}/api/auth/resetPassword/${user._id}/${token}`;
//         return res.status(OK).send(
//           sendSuccess({
//             status: true,
//             message: RESET_LINK_SUCCESS,
//             data: link,
//           })
//         );
//       } else {
//         return res
//           .status(NOTFOUND)
//           .send(sendError({ status: false, message: NO_USER_FOUND }));
//       }
//     } else {
//       return res
//         .status(BADREQUEST)
//         .send(sendError({ status: false, message: MISSING_FIELD_EMAIL }));
//     }
//   } catch (error) {
//     return res.status(INTERNALERROR).send(
//       sendError({
//         status: false,
//         message: error.message,
//         data: null,
//       })
//     );
//   }
// };

// @desc    Send Reset Password Email
// @route   POST api/auth/resetPasswordRequest
// @access  Public

// export const resetPassword = async (req, res) => {
//     try {
//         const { password, confirmPassword } = req.body;
//         const { id, token } = req.params;
//         const user = await Users.findById(id);
//         if (user) {
//             const secret = user._id + process.env.JWT_SECRET_KEY;

//             ValidateToken({ token: token, key: secret });
//             res.send(isVerifed);
//         } else {
//             return res
//                 .status(NOTFOUND)
//                 .send(sendError({ status: false, message: NO_USER_FOUND }));
//         }

//         // if (email) {
//         //   const user = await Users.findOne({ "Authentication.Email": email });
//         //   if(user){
//         //     const secret = user._id + process.env.JWT_SECRET_KEY
//         //     const token = GenerateToken({ data: secret , expiresIn :"30m" });
//         //     const link = `${process.env.WEB_LINK}/api/auth/resetPassword/${user._id}/${token}`
//         //     console.log(link);
//         //     return res.status(OK).send(sendSuccess({status : true , message : RESET_LINK_SUCCESS , data : link}))

//         //   } else {
//         //     return res.status(NOTFOUND).send(sendError({status : false , message : NO_USER_FOUND}))
//         //   }
//         // } else {
//         //   return res
//         //     .status(BADREQUEST)
//         //     .send(sendError({ status: false, message: MISSING_FIELD_EMAIL }));
//         // }
//     } catch (error) {
//         return res.status(INTERNALERROR).send(
//             sendError({
//                 status: false,
//                 message: error.message,
//                 data: null,
//             })
//         );
//     }
// };

// @desc    Logout User
// @route   POST api/auth/logout
// @access  Public

// export const logout = async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (token) {
//     } else {
//       return res
//         .status(BADREQUEST)
//         .send(sendError({ status: false, message: MISSING_FIELDS }));
//     }
//   } catch (error) {
//     return res.status(INTERNALERROR).send(
//       sendError({
//         status: false,
//         message: error.message,
//         data: null,
//       })
//     );
//   }
// };

// @desc    Save DeviceId
// @route   POST api/auth/saveDeviceId
// @access  Public

// export const addDeviceId = async (req, res) => {
//   try {
//     console.log(req.body);
//     const { deviceId } = req.body;
//     const id = req.user._id;
//     if (deviceId) {
//       let user = await Users.findOne({ _id: id });
//       if (user) {
//         // update user with this deveiceId
//         user = await Users.findByIdAndUpdate(id, {
//           $set: { 'Authentication.DeviceId': deviceId },
//         });
//         res.status(OK).send(
//           sendSuccess({
//             status: true,
//             message: 'DeviceId Saved Successfully',
//           })
//         );
//       } else {
//         return res
//           .status(OK)
//           .send(sendError({ status: false, message: NO_USER }));
//       }
//     } else {
//       return res
//         .status(BADREQUEST)
//         .send(sendError({ status: false, message: MISSING_FIELDS }));
//     }
//   } catch (error) {
//     return res.status(INTERNALERROR).send(
//       sendError({
//         status: false,
//         message: error.message,
//         data: null,
//       })
//     );
//   }
// };
