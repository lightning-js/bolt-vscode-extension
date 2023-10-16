/*
 * Copyright 2023 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const vscode = require('vscode')
const templateHelper = require('../helpers/template')
const completionItems = require('../completionItems')
const parse = require('../parsers')

module.exports = vscode.languages.registerCompletionItemProvider(
  [{ language: 'javascript' }, { language: 'typescript' }],
  {
    // eslint-disable-next-line no-unused-vars
    async provideCompletionItems(document, position, token, context) {
      const currentDoc = document.getText()
      const fileExtension = document.uri.fsPath.split('.').pop()
      const currentDocAst = parse.AST(currentDoc, fileExtension)

      if (
        templateHelper.isCursorInsideTemplate(document, currentDocAst, position)
      ) {
        const currentLine = document.lineAt(position).text
        const { tagName, attributes } =
          templateHelper.getExistingTagAndAttributes(currentLine)

        console.log(`Current tag: ${tagName}`)

        // fixme: in some cases the content of a tag can be multiline
        if (tagName) {
          // hardcoded for now, Blits will provide a map for rendererer props
          if (tagName === 'Element') {
            return await completionItems.elementProps(
              tagName,
              attributes,
              document,
              currentDocAst
            )
          } else {
            // get props for custom component
            return await completionItems.componentProps(
              tagName,
              attributes,
              document,
              currentDocAst
            )
          }
        }
      }
      return []
    },
  },
  ':'
)
