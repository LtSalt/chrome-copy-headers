'use strict'

// code adapted from: https://github.com/farski/http-headers-crx/blob/main/page_action/popup.js

// Copyright (c) original code: 2016 Christopher Kalafarski.
// Copyright (c) modified code: 2023 David Will

//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#copy-headers-btn');
    button.addEventListener('click', handleClick)
});

async function handleClick() {
    const records = await getRecords()

    if (!records) {
        console.log("No headers present for current tab.")
        window.close();
        return 
    }
    
    const headers = JSON.parse(records)
        .map(parseHeaders)
        .reduce((acc, curr) => ({ ...acc, ...curr}))

    copyToClipboard(headers);
    window.close();
}

async function getRecords() {
    const tabs = await chrome.tabs.query({ currentWindow: true, active: true});
    const tab = tabs[0];
    
    const result = await chrome.storage.local.get([`${tab.id}`])
    return result[`${tab.id}`];
}

function parseHeaders(records) {
    const type = Object.hasOwn(records, 'requestHeaders') ? 'requestHeaders' : 'responseHeaders';
    const headers = records[type]
    const result = headers.reduce((acc, curr) => ({...acc, [curr.name]: curr.value}))
    
    return { [type]: result}
}

function copyToClipboard(headers) {
    const json = JSON.stringify(headers)
    
    const textArea = document.createElement('textarea');
    textArea.value = json;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';

    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')

    document.body.removeChild(textArea)
}