/* eslint-disable max-len */
// This requires Anki and the AnkiConnect extension. Anki must be running.
// You must configure ankiconnect to allow cross-origin requests from https://roamresearch.com.
// Go to Anki -> Tools -> Addons -> Anki Connect -> Config and amend `webCorsOriginList`
// On any given page, the plugin will cause Anki to display all matches for the value stored in the following attribute:
const ATTRIBUTE_NAME = 'Anki Tag';

// --- internals below this ---
const invokeAnkiConnect = (action, version, params = {}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('error', () => reject(Error('failed to issue request')));
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (Object.getOwnPropertyNames(response).length != 2) {
          throw Error('response has an unexpected number of fields');
        }
        if (!response.hasOwnProperty('error')) {
          throw Error('response is missing required error field');
        }
        if (!response.hasOwnProperty('result')) {
          throw Error('response is missing required result field');
        }
        if (response.error) {
          throw response.error;
        }
        resolve(response.result);
      } catch (e) {
        reject(e);
      }
    });

    xhr.open('POST', 'http://localhost:8765');
    xhr.send(JSON.stringify({action, version, params}));
  });
};

// Given an input or the current page, returns map of attributes.
const getConfigFromPage = (inputPage) => {
  const page =
        inputPage ||
        document.getElementsByClassName('rm-title-display')[0]?.textContent;
  if (!page) {
    return {};
  }
  return getAttrConfigFromQuery(
      `[:find (pull ?e [*]) :where [?e :node/title "${page}"] ]`,
  );
};

// This function is handpicked from David Vargas' roam-client https://github.com/dvargas92495/roam-client
// It is used to grab configuration from a Roam page.
const getAttrConfigFromQuery = (query) => {
  const pageResults = window.roamAlphaAPI.q(query);
  if (pageResults.length === 0 || !pageResults[0][0].attrs) {
    return {};
  }

  const configurationAttrRefs = pageResults[0][0].attrs.map(
      (a) => a[2].source[1],
  );
  const entries = configurationAttrRefs.map(
      (r) =>
        window.roamAlphaAPI
            .q(
                `[:find (pull ?e [:block/string]) :where [?e :block/uid "${r}"] ]`,
            )[0][0]
            .string?.split('::')
            .map(toAttributeValue) || [r, 'undefined'],
  );
  return Object.fromEntries(entries);
};

// This function is handpicked from David Vargas' roam-client https://github.com/dvargas92495/roam-client
// It is used to grab configuration from a Roam page.
const toAttributeValue = (s) =>
  (s.trim().startsWith('{{or: ') ?
        s.substring('{{or: '.length, s.indexOf('|')) :
        s
  ).trim();

const openInAnki = async () => {
  const ankiSearchTerm = getConfigFromPage()[ATTRIBUTE_NAME];
  console.log('searching for ' + ankiSearchTerm);
  await invokeAnkiConnect('guiBrowse', 6, {'query': `${ankiSearchTerm}`});
};

const renderAnkiButton = () => {
  const openInAnkiButton = document.createElement('span');
  openInAnkiButton.classList.add('bp3-popover-wrapper');
  openInAnkiButton.setAttribute('style', 'margin-left: 4px;');
  const outerSpan = document.createElement('span');
  outerSpan.classList.add('bp3-popover-target');
  openInAnkiButton.appendChild(outerSpan);
  const icon = document.createElement('span');
  icon.id = 'open-anki-icon';
  icon.setAttribute('status', 'off');
  icon.classList.add('bp3-icon-repeat', 'bp3-button', 'bp3-minimal', 'bp3-small');
  outerSpan.appendChild(icon);
  /** workaround needed because roam/js can load before the topbar */
  function renderInTopbar() {
    if (!document.getElementsByClassName('rm-topbar')) {
      window.requestAnimationFrame(renderInTopbar);
    } else {
      document.getElementsByClassName('rm-topbar')[0].appendChild(openInAnkiButton);
    }
  }
  renderInTopbar();
  icon.onclick = openInAnki;
};

if (document.getElementById('open-anki-icon') == null) {
  try {
    renderAnkiButton();
  } catch (e) {
    window.requestAnimationFrame(renderAnkiButton);
  }
};
