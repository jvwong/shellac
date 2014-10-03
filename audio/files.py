"""
Utility functions for handling audio.
"""
from django.core.files import File
from django.db.models.fields.files import FieldFile, FileDescriptor

class AudioFile(File):
    """
    A mixin for use alongside audio.files, which provides
    additional features for dealing with images.
    """
    def _get_audio_meta(self):
        return get_audio_meta(self, close=False)


def get_audio_meta(file_or_path, close=False):
    """
    Returns the meta data f an audio clip, given an open file or a path.  Set
    'close' to True to close the file at the end if it is initially in an open
    state.
    """
    pass


class AudioFileDescriptor(FileDescriptor):
    """
    Just like the FileDescriptor, but for AudioFields. Should calculate
    the approximate length in time of the clip.
    """
    def __set__(self, instance, value):
        super(AudioFileDescriptor, self).__set__(instance, value)


class AudioFieldFile(AudioFile, FieldFile):
    def delete(self, save=True):
        super(AudioFieldFile, self).delete(save)

