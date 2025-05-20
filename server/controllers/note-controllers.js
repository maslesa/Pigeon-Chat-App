const Note = require('../models/Note');

const fetchUserNotes = async(req, res) => {
    try {
        const userId = req.userInfo.id;
        const notes = await Note.find({user: userId});

        if(notes.length === 0){
            return res.status(200).json({
                success: true,
                message: 'No notes found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'notes fetched successfully',
            notes: notes
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const addNote = async(req, res) => {
    try {
        const userId = req.userInfo.id;
        const {body} = req.body;

        const newNote = await Note.create({
            body: body,
            user: userId
        })

        if(!newNote){
            return res.status(400).json({
                success: false,
                message: 'error creating new note'
            })
        }

        res.status(200).json({
            success: true,
            message: 'note created successfully',
            note: newNote
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}

const deleteNote = async(req, res) => {
    try {

        const userId = req.userInfo.id;
        const noteId = req.params.noteId;
        const note = await Note.findById(noteId);

        if(!note){
            return res.status(404).json({
                success: false,
                message: 'note not found'
            })
        }

        if(note.user.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: 'you are not authorized to delete this note'
            })
        }

        await Note.findByIdAndDelete(noteId);

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong',
        })
    }
}



module.exports = {
    fetchUserNotes,
    addNote,
    deleteNote,
}