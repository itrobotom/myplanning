import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from "../models/User.js"


export const autorization = async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email }); //проверяем, найдем ли мы такого пользователя с почтой
        //проверяем только для удобства разработки, в реальном проекте не надо указывать причину, иначе будет легко злоумышлинникам понять, почему авторизация не прошла и использовать это для дальнейшего взлома
        // if(!user) {
        //     return res.status(404).json({
        //         message: 'Пользователь не найден', 
        //     })
        // }
        console.log(user._doc.passwordHash); //проверим в консоли пароль зашифрованный
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash); //сравниваем введенный пароль с зашифрованным на стороне сервера
        if(!isValidPass) {
            return res.status(400).json({
                message: "Неверный логин или пароль", //указываем или т.к. для защиты информации лучше не раскрывать, в чем была ошибка, чтобы сложнее было подобрать данные для входа
            })
        }
        //если введенная почта верная и пароль валидный, то как и при регистрации создадим новый токен
        const token = jwt.sign(
            {
                _id: user.id,
            },
            'keyToDo673490', //ключ, за счет которого шифруется токен
            {
                expiresIn: '30d', //сколько живет токен
            }
        );
        //возвращаем данные о пользователе
        const { passwordHash, ...userData } = user._doc; //вытаскиваем через деструктуризацию все
        //res.status(500).json({user}); //вернем информацию о пользователе, а именно документ user
        res.json({
            ...userData, //создаем новый объект, поэтому используем ...user._doc, а так вот тоже работает просто с user, а без зашифрованного пароля ...userData
            token,
        }); //если возращать всю информацию о user, то надо указать ...user
    } catch (err) {
        res.json({
            message: "Не удалось авторизоваться",
        })
        console.log("Ошибка", err);
    } 
}

export const registration = async (req, res) => {
    try {
        const { nickName, email, password, aboutMe, gender, tgName, instName, vkLink, friends, avatarUrl } = req.body; //вытаскиваем нужные параметры через деструктуризацию
        // Проверка уникальности ника и email
        const existingUserByNickName = await UserModel.findOne({ nickName });
        if (existingUserByNickName) {
            return res.status(400).json({ message: "Ник уже занят" });
        }
        const existingUserByEmail = await UserModel.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Email уже занят" });
        }
        const salt = await bcrypt.genSalt(10); //способ шифрования
        const hash = await bcrypt.hash(password, salt); //создаем из обычной строки по алгоритма salt зашифрованный пароль

        const doc = new UserModel({
            nickName: nickName,
            email: email,
            passwordHash: hash,
            aboutMe: aboutMe,
            gender: gender,
            tgName: tgName,
            instName: instName,
            vkLink: vkLink,
            friends: friends,
            avatarUrl: avatarUrl,
        })

        const user = await doc.save(); 
        const token = jwt.sign(
            {
                _id: user.id,
            },
            'keyToDo673490', //ключ, за счет которого шифруется токен
            {
                expiresIn: '30d', //сколько живет токен
            }
        );
        const { passwordHash, ...userData } = user._doc; //вытаскиваем через деструктуризацию все, кроме passwordHash

        //res.status(500).json({user}); //вернем информацию о пользователе, а именно документ user
        res.json({
            ...userData, //создаем новый объект, поэтому используем ...user._doc, а так вот тоже работает просто с user, а без зашифрованного пароля ...userData
            token,
        }); //если возращать всю информацию о user, то надо указать ...user
    } catch(err){
        res.json({
            message: "Не удалось зарегистрироваться",
        })
        console.log("Ошибка", err);
    }
}

export const updateUser = async (req, res) => {
    try {
        const { nickName, email, aboutMe, gender, tgName, instName, vkLink, friends, avatarUrl } = req.body;
        const existingUserByNickName = await UserModel.findOne({ nickName });
        if (existingUserByNickName) {
            return res.status(400).json({ message: "Ник уже занят" });
        }
        const existingUserByEmail = await UserModel.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Email уже занят" });
        }
        const userId = req.params.id;
        await UserModel.updateOne(
            {
                _id: userId,
            },
            {
                $set: {
                    nickName: nickName,
                    email: email,
                    aboutMe: aboutMe,
                    gender: gender,
                    tgName: tgName,
                    instName: instName,
                    vkLink: vkLink,
                    friends: friends,
                    avatarUrl: avatarUrl,
                }
            }
        );
        res.json({
            success: true,
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось отредактировать пользователя',
        });
    }
}

// данный вариант функции подойдет для обновления только нужных полей, например ссылки на аватарку в базе, может потом развить этот способ
// export const updateUser = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const updates = req.body;

//         // Проверка уникальности никнейма и email, если они присутствуют в обновляемых данных
//         if (updates.nickName) {
//             const existingUserByNickName = await UserModel.findOne({ nickName: updates.nickName });
//             if (existingUserByNickName && existingUserByNickName._id.toString() !== userId) {
//                 return res.status(400).json({ message: "Ник уже занят" });
//             }
//         }

//         if (updates.email) {
//             const existingUserByEmail = await UserModel.findOne({ email: updates.email });
//             if (existingUserByEmail && existingUserByEmail._id.toString() !== userId) {
//                 return res.status(400).json({ message: "Email уже занят" });
//             }
//         }

//         await UserModel.updateOne(
//             { _id: userId },
//             { $set: updates }
//         );

//         res.json({
//             success: true,
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: 'Не удалось отредактировать пользователя',
//         });
//     }
// };

export const deleteUser = async (req, res) => {
    try {
        //может все-таки id вытащить из req!!!!!!!!!!!!!!!!
        //или также через checkAuth, только там хитро не вернули его, а так req.userId = decoded._id;
        const userId = req.params.id;

        //удалить аватар (фото) пользователя, если он есть, если не получилось удалить фото, то всеравно продолжаем удалять запись из БД

        //удалим запись из БД о пользователе
        const deleteUser = await UserModel.findOneAndDelete({
            _id: userId,
        });
        if(!deleteUser) {
            console.log("Пользователь для удаления не найден");
            return res.status(404).json({
                message: 'Пользователь для удаления не найден'
            })
        }
        console.log("Пользователь успешно удален");
        res.json({
            success: true,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Не удалось удалить пользователя",
        })
    }
}

//запрос для проверки, авторизован ли пользователь, если данные вернутся, значит авторизован, если токен не актуальный или его нет, не будет доступа
export const getMeInfo = async (req, res) => { //функция (req, res) выполниться только после успешного выполнения midleware checkAuth
    try {
        //userId мы как раз получили из checkAuth, только там хитро не вернули его, а так req.userId = decoded._id;
        const user = await UserModel.findById(req.userId); 
        
        if(!user){
            res.status(404).json({
                message: 'Пользователь не найден',
            })
        }
        const { passwordHash, ...userData } = user._doc;
        res.json(userData); //вытащим и вернем все данные без зашифрованного пароля
    }
    catch(err){
        console.log(err); 
        res.status(500).json({
            message: 'Нет доступа',
        })
    }
}

export const getAllUsers = async (req, res) => { //получаем всех пользователей с приватностью public (доступен поиск по нику)
    try {
        const { search } = req.query; // Получение параметра запроса
        let users;

        // Условие для поиска пользователей с приватностью профиля public
        const query = { profilePrivacy: 'public' };

        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Создание регулярного выражения для поиска (без учета регистра)
            query.nickName = searchRegex;
        }

        // Поиск пользователей с указанными полями
        users = await UserModel.find(query).select('nickName aboutMe gender tgName instName vkLink friends avatarUrl');

        res.status(200).json(users); // Отправка ответа с пользователями
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении пользователей', error });
    }
};