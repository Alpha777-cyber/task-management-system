const express = require('express');
const tasks = require('../models/tasks');
const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const task = await tasks.create(req.body);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }

});


router.get('/', async (req, res) => {
    try {
        const filter = {};

        if (req.query.user) {
            filter.user = req.query.user;
        }

        const thetasks = await tasks.find(filter);
        res.json({
            success: true,
            data: thetasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'server error'
        });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const task = await tasks.findById(req.params.id)

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            })
        }
        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const task = await tasks.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'task not found'
            });
        }
        res.status(200).json({
            success: true,
            data: task
        })
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const task = await tasks.findByIdAndDelete(
            req.params.id
        )
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'task not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'task deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


//mark the task as complete
router.patch('/:id/complete', async (req, res) => {
    try {
        const task = await tasks.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'task not found'
            });
        }
        res.status(200).json({
            success: true,
            data: task
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }
});

module.exports = router;