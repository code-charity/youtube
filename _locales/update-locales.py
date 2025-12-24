#!/usr/bin/env python
# coding: utf-8

import glob
import json


def main():
    with open('en/messages.json', 'r', encoding='utf-8') as file:
        en_messages = json.load(file)

    en_keys = en_messages.keys()

    tr_files = glob.glob('*/messages.json')
    tr_files.remove('en/messages.json')

    for tr_file in tr_files:
        print(f'Update {tr_file}...')

        with open(tr_file, 'r', encoding='utf-8') as file:
            tr_messages = json.load(file)

        tr_keys = tr_messages.keys()

        for en_key in en_keys:
            if en_key not in tr_keys:
                tr_messages[en_key] = en_messages[en_key]

        with open(tr_file, 'w', encoding='utf-8') as file:
            json.dump(
                tr_messages, file, ensure_ascii=False, indent=2,
                sort_keys=True)


if __name__ == '__main__':
    main()
