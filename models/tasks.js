const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String,
        trim: true,
        maxlength: [100, 'Title can not exceed 100 characters'],
        validate: {
            validator: async function (givenTitle) {
                const name = await mongoose.models.tasks.findOne({ title: givenTitle });
                return !name;
            },
            message: 'the title already exists!'
        }
    },
    description: {
        required: false,
        type: String,
        default: 'remember to do this'
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in-progress', 'completed']
        },
        default: 'pending'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, { timestamps: true });


const tasks = mongoose.model('tasks', taskSchema);

module.exports = tasks
