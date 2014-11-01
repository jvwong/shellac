import os.path
import datetime
import logging
from uuid import uuid4

old_file = 'sounds/2014/11/01/939cc00aa902479cbedf7c5a1e38bd8f.mp3'
new_file = 'water.mp3'

import re
upload_to_pattern = re.compile(r'(?P<prefix>\w+)\/(?P<year>\d{4})\/(?P<month>\d{2})\/(?P<day>\d{2})\/(?P<filename>\w+\.\w{3,4})')

def path_and_rename(path):
    def wrapper(instance, filename):

        date_prefix = (datetime.datetime.now()).strftime('%Y/%m/%d')
        path_date = os.path.join(path, date_prefix)

        ##May need to guard against weird input (non file)
        fname = os.path.split(filename)[1]

        ##just get the extension
        ext = fname.split('.')[-1]

        # set filename as name + random string
        fn = '{}.{}'.format(uuid4().hex, ext)

        # print("path_and_rename: {}".format(path_date))
        # print("fn: {}".format(fn))

        # return the whole path to the file
        return os.path.join(path_date, fn)

    return wrapper

def get_updated_url(old_file, new_file):

    match = upload_to_pattern.fullmatch(old_file)

    ###bail if the old file doesn't match the prefix/YYYY/MM/DD/name.ext pattern
    if not match:
        return

    #Extract the prefix from the old file
    new_file_filename = os.path.split(new_file)[1]

    match_group = match.group(0)
    prefix = match.group('prefix')
    year = match.group('year')
    month = match.group('month')
    day = match.group('day')
    filename = match.group('filename')

    print("match_group: {}".format(match_group))
    print("prefix: {}".format(prefix))
    print("year: {}".format(year))
    print("month: {}".format(month))
    print("day: {}".format(day))
    print("filename: {}".format(filename))

    ###reconstruct the file
    wrapper = path_and_rename(prefix)
    updated_file_path = wrapper(None, new_file_filename)
    print(updated_file_path)

    ########BUT this won't be the saved filename after path_and_rename is
    ##called by Django!@ SHIIIIIIIIT.

get_updated_url(old_file, new_file)