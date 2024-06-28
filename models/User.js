import mongoose from "mongoose"
//модель пользователя 
const UserSchema = new mongoose.Schema(
    {
        nickName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            //unique: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        aboutMe: {
            type: String,
            default: "",
        },                        
        gender: {
            type: String,
            default: "",
        },
        tgName: {
            type: String,
            default: "",
        },
        instName: {
            type: String,
            default: "",
        },
        vkLink: {
            type: String,
            default: "",
        },
        friends: {
            type: Array,
            default: [], // Значение по умолчанию — пустой массив
        },
        avatarUrl: {
            type: String,
            default: "", 
        },
        profilePrivacy: { // Поле для настройки приватности профиля (будет отображаться на главной страницы или нет)
            type: String,
            enum: ['public', 'private', 'private_for_unlogin'], //открыто, закрыто для всех, закрыто только для неавторизованных 
            default: 'public',
        }
    },
    {
        timestamp: true, //создаем поле для фиксации время, когда был пользователь создан или обновлен
    },
);

export default mongoose.model('User', UserSchema);