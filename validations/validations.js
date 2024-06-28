import { body } from 'express-validator'

export const regValidation = [
    body('nickName', 'Введите корректный никнейм').isLength({ min: 2 }).isString(),
    body('email', 'неверный формат почты').isEmail(),
    body('password', 'пароль должен быть минимум 5 символов').isLength({min: 5}),
    body('aboutMe', 'введите информацию о себе в виде строк').optional().isString(),
    body('gender', 'введите свой пол в виде "м", "ж" или "не указано"')
        .optional()
        .isString()
        .isIn(['м', 'ж', 'не указано']),
    // .matches(/^@[A-Za-z0-9_]+$/): Проверяем, что значение соответствует регулярному выражению, которое требует, чтобы строка начиналась с @, за которым могут следовать буквы, цифры или символы подчеркивания.
    body('tgName', 'Введите ник в Telegram, начиная с @').optional().isString().matches(/^@[A-Za-z0-9_]+$/),
    body('instName', 'Введите ник в instagram, начиная с @').optional().isString().matches(/^@[A-Za-z0-9_]+$/),
    body('vkLink', 'введите ссылку на страницу в ВК').optional().isString(),
    body('avatarUrl', 'неверная ссылка на аватарку').optional().isURL(),
]


export const autorizationValidation = [
    body('email', 'неверный формат почты').isEmail(),
    body('password', 'пароль должен быть минимум 5 символов').isLength({min: 5}),
]

export const newsCreateValidation = [
    body('title', 'Введите заголовок новости').isLength({ min: 3 }).isString(),
    body('text', 'Введите текст новости').isLength({ min: 3 }).isString(),
    body('typesProgramStore', 'Неверный формат типа программ').optional().isArray(),
    body('dateNewsFormat', 'Неверно указана дата').optional().isDate(), //было .isString()
    body('linkProgramm', 'Неверная ссылка на образовательную программу').optional().isString(),
    body('linkNews', 'Неверная ссылка источник новости').optional().isString(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
    body('programName', 'Неверный формат названия программы').optional().isString(),
]

export const programCreateValidation = [
    body('typesProgramKlimov', 'Отметьте подходщие пункты по Климову').optional().isArray(),
    body('typesProgram', 'Отметьте подходщие пункты по стандартной специализации').isArray(),
    body('titleProgram', 'Введите название образовательной программы').isLength({ min: 3 }).isString(),
    body('shortTitleProgram', 'Введите сокращенное название образовательной программы').isLength({ min: 3 }).isString(),
    body('numLessons', 'Неверный формат количества занятий.').optional().isString(),
    body('trainingPeriod', 'Неверный формат периода обучения.').optional().isString(),
    body('linkVideo', 'Неверный формат ссылки на видео.').optional().isString(),
    body('commentVideo', 'Неверный формат комментария.').optional().isString(),
    body('linkGroup', 'Неверный формат ссылки на группу.').optional().isString(),
    body('isBudgetProgramm', 'Укажите тип услуги по финансированию.').isBoolean(),
    body('commentProgram', 'Неверный формат комментария к программе.').optional().isString(),
    body('ageRangeProgram', 'Укажите корректно две границы по возрасту').isArray(),
    body('numberStudents', 'Укажите корректно две границы по количеству обучащихся').isArray(),
    body('instructors', 'Укажите корректно данные педагога(ов)').isArray(),
    body('textProgram', 'Введите аннотацию программы минимиум 100 символов').isLength({ min: 10 }).isString(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
    body('linkPosts', 'Укажите корректно данные по событию').optional().isArray(),
    body('fileUrl', 'Проблема с загрузкой файла программы.').optional().isString(),
    body('arrLinkImg', 'Проблемы с сохранением ссылок изображений в массив').optional().isArray(),

]