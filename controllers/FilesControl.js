import multer from "multer"
import UserModel from "../models/User.js"
import fs from 'fs';
import path from 'path';

//создаем хранилище
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let folder = 'uploads/otherFiles'; // По умолчанию загружаем изображения сюда (в фото новостей)
        if (req.url === '/uploads_avatar') { // Если URL соответствует загрузке постера, сохраняем в другую папку
            folder = 'uploads/avatarsUser';
        }
        callback(null, folder);
    },
    filename: (_, file, callback) => {
        callback(null, file.originalname);
    },
});

export const upload = multer({ storage }); // Создаем экземпляр multer с хранилищем

export const uploadPhoto = async (req, res) => { // тип загружаемых файлов 'image' 
    try {
        //МЫ НЕ ИЩЕМ ПОЛЬЗОВАТЕЛЯ, Т.К. ДЛЯ СОХРАНЕНИЯ ССЫЛКИ МЫ ВОСПОЛЬЗУЕМСЯ ДРУГИМ ЗАПРОСОМ ДЛЯ ОБНОВЛЕНИЯ ПОЛЕЙ ПОЛЬЗОВАТЕЛЯ И ВСЕ, НАЖАВ СОХРАНИТЬ. 

        if (!req.file) {
            return res.status(400).json({ error: 'Изображение не было загружено' });
        }
        // Здесь можно добавить код для проверки размера файла и его обработки, пока реализовал на фронтеде
        res.json({
            url: `/uploads/avatarsUser/${req.file.originalname}`,//originalname - имя пришедшее с фронтеда (там оно генерируется уникальным)
        });
    } catch (error) {
        console.error('Ошибка при загрузке и обработке изображения:', error);
        res.status(500).json({ error: 'Произошла ошибка при загрузке и обработке изображения' });
    }
}


// Обработчик удаления фото
export const deletePhotoAndUpdateUser = async (req, res) => {
    try {
        //А ВОТ ПРИ УДАЛЕНИИ ФОТО МЫ СРАЗУ УДАЛИМ И ССЫЛКУ НА ФОТО
        const { user_id, fileName, folderName } = req.body;
        console.log("id пользователя с фронтенда:", user_id);
        console.log("Название аватара:", fileName);
        
        // Найти пользователя по userId
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        // Абсолютный путь к папке с файлами
        const uploadsDir = `C:/proj_js/express_git/toDo_backend/uploads/${folderName}`;
        const filePath = path.join(uploadsDir, fileName);
        // Убедимся, что путь к файлу существует и файл действительно существует
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Аватар не найден' });
        }
        // Удаляем файл
        deleteFile(filePath);
        // Обновляем запись пользователя, удаляя ссылку на аватар
        user.avatarUrl = '';
        await user.save();

        res.status(200).json({ message: 'Аватар и ссылка на него успешно удалены' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось удалить аватар и ссылку' });
    }
};








// Функция для удаления файла
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Ошибка при удалении файла:', err);
            // Здесь можно отправить ответ об ошибке клиенту
        } else {
            console.log('Файл успешно удален:', filePath);
            // Здесь можно отправить ответ об успешном удалении клиенту
        }
    });
};