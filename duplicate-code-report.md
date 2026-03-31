# Duplicate Code Analysis Report

## Summary
- Files analyzed: 20
- Functions extracted: 137
- Minimum function lines: 7
- Similarity threshold: 80%
- Similar groups found: 7

## Duplicate Code Groups

### Group 1 (36 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 31-39 | `(v:v,v:v)=>{v=v.v.v(v)v(!v||v==='v')v{v.v(v)}v(v){...` |
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 244-255 | `()=>{v.v(...v('v',[]))v(v.v===0){v=v(v)v.v(v,{v:v,...` |
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 257-276 | `()=>{v.v('v',(v)=>{v(v.v){v}v(v.v==='?'){v.v()v(v(...` |
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 260-273 | `(v)=>{v(v.v){v}v(v.v==='?'){v.v()v(v(v()))}v(v.v==...` |
| src/plugins/wirecutter-anti-modal/userscript.ts | <anonymous> | 13-23 | `(v:v):v=>{v(!v&&v.v==='v'){v(v.v){v=v(v.v==='v-v-v...` |
| src/plugins/wirecutter-anti-modal/userscript.ts | <anonymous> | 25-33 | `(v:v):v=>{v(!v&&v.v==='v'&&v.v==='v'){v=v.v(v.v===...` |
| src/plugins/wirecutter-anti-modal/userscript.ts | <anonymous> | 35-51 | `():v=>{v:v=(v,v)=>{v(v){v(v)v(v)v(v&&v){v.v()}}}v(...` |
| src/plugins/shawnee-mission-post-paywall-remover/userscript.ts | <anonymous> | 8-17 | `(v)=>{v(v){v(v.v==='v'){v(v)}v(v.v==='v'){v(v)}}}` |
| src/plugins/shawnee-mission-post-paywall-remover/userscript.ts | <anonymous> | 19-26 | `(v:v)=>{v(v.v.v===v.v){v=v.v(v.v.v('v-v')){v.v.v('...` |
| src/plugins/shawnee-mission-post-paywall-remover/userscript.ts | <anonymous> | 28-37 | `(v:v)=>{v(v.v(v.v)){v(v.v===v.v){v=v(v.v.v('v-v'))...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 26-34 | `(v:v,v:v)=>{v=v.v.v(v)v(!v||v==='v')v{v.v(v)}v(v){...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 258-266 | `(v:v[]):v[]=>{v:v<v,v>={v:0,v:1,v:2,}v.v((v,v)=>v[...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 34-42 | `(v:v,v:v)=>{v=v.v.v(v)v(!v||v==='v')v{v.v(v)}v(v){...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 81-94 | `()=>{v.v(...v('v',[]))v.v(...v('v',[]))v(!v.v||!v....` |
| src/plugins/kansas-city-star-anti-annoy/userscript.ts | <anonymous> | 1-18 | `()=>{v=v((v)=>{v(v){v(v.v){v(v.v==='v-v'){v(v.v){v...` |
| src/plugins/kansas-city-star-anti-annoy/userscript.ts | <anonymous> | 2-12 | `(v)=>{v(v){v(v.v){v(v.v==='v-v'){v(v.v){v.v.v(v)}}...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 57-63 | `<v>(v:v):v=>{v{v.v(v)v}v(v){v(`v:${v}`)}}` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 99-106 | `(v:v,v?:v)=>{v=v().v()v(v){v.v(`[v${v}]${v}`,v)}v{...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 484-492 | `(v)=>{v.v()v.v=v.v='⏳v...'v().v(()=>{v.v=v.v='📧v'...` |
| src/plugins/facebook-hide-marketplace-deals/userscript.ts | <anonymous> | 8-15 | `(v:v):v=>{v(v.v===v.v){v=(v).v<v>("v[v*='v']")v(v)...` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 26-32 | `():v=>{v=v[v].v<v>('v.v-v-v')v(v){v.v()}}` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 42-49 | `():v=>{v=v.v('v')v=v.v('v')v.v.v('v-v')v.v='v'v.v(...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 143-152 | `():v=>{v=v.v('.v-v')v(v){v=v.v('v')v.v.v('v-v')v.v...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 154-160 | `():v=>{v()v=v.v('v.v-v-v-v')v(v.v(v)){v(v)}}` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 174-188 | `()=>{v(v.v(v)){v()}v(v.v(v)&&!v.v(v)){v()}v(v.v(v)...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 188-202 | `(v)=>{v(v){v(v.v==='v'){v(v.v){v=v(v.v&&(v.v.v('v....` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 211-221 | `v():v<v>=>{v=v()v(v){v(v.v.v.v('v/v')!==-1){v(v,v....` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 159-173 | `(v:v):v=>{v(v.v===v.v){v=v(v.v==='v'){v(v)}v=v.v('...` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 185-196 | `v():v<v>=>{v.v('v')v()v.v(v.v,{v:v,v:v,})}` |
| src/plugins/amazon-goodreads-meta/userscript.ts | <anonymous> | 122-133 | `v()=>{v=v()v(!v||v.v===0){v}v{v(v)}v(v){v.v('v:',v...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 82-89 | `():v|v=>{v=v.v.v=v(/v\.([v-v]{2,3}(?:\.[v-v]{2})?)...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 155-164 | `():v|v=>{v(v){v=v.v(v)v(v){v('v:',v)v}}v}` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 406-415 | `()=>{v.v.v('v')v{v.v(`${v}-v`,v.v.v('v')?'v':'v')}...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 515-530 | `(v,v)=>{v++v(v.v(`${v}-v`)){v.v()v}v(v>=v){v.v()v(...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 545-554 | `()=>{v(v.v!==v){v=v.v('v,v')v(v(){v(v)},v)}}` |
| src/plugins/amazon-add-to-goodreads/userscript.ts | <anonymous> | 3-11 | `():v=>{v=v.v(v.v.v)v=v&&v.v>1?v[1]:''v.v(`v:${v}`)...` |

**Sample Normalized Code:**

```typescript
(v:v,v:v)=>{v=v.v.v(v)v(!v||v==='v')v{v.v(v)}v(v){v}}
```

**Original Code Sample (first function):**

```typescript
(key: string, defaultVal: any) => {
  const val = window.sessionStorage.getItem(key)
  if (!val || val === 'undefined') return defaultVal
  try {
    return JSON.parse(val)
  } catch (_e) {
    return val
  }
}
```

### Group 2 (35 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 41-74 | `(v,v)=>{v(v){v(v.v.v>0&&v.v[0].v===v.v&&v.v[0].v==...` |
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 209-242 | `(v:v[])=>{v:v[]=[...v]v(v)v(v){v(v.v===v.v){v=v.v(...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 36-67 | `()=>{v.v(...v('v',[]))v.v(...v('v',[]))v(!v.v||!v....` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 44-79 | `(v,v)=>{v(v){v(v.v.v>0&&v.v[0].v===v.v&&v.v[0].v==...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 209-236 | `(v:v,v:v):v|v=>{v=v.v[0].v??''v(v.v.v('v-v')){v{v:...` |
| src/plugins/microcenter-sort-by-stock/userscript.ts | <anonymous> | 1-23 | `()=>{v=v.v<v>('v.v>v.v.v-v')v(v){v=v.v<v>('v')v=v....` |
| src/plugins/lichess-opening-explorer/userscript.ts | <anonymous> | 49-80 | `():v[]=>{v.v('===v===\v')v=v.v('v,v')v(!v){v[]}v=v...` |
| src/plugins/lichess-opening-explorer/userscript.ts | <anonymous> | 82-118 | `v(v:v)=>{v{v=v.v(v)v=v.v(v)v(v){v.v('v:',v)v}v.v('...` |
| src/plugins/lichess-opening-explorer/userscript.ts | <anonymous> | 120-138 | `(v:v|v)=>{v=v.v('v-v-v')v(!v){v=v.v('v')v.v='v-v-v...` |
| src/plugins/lichess-opening-explorer/userscript.ts | <anonymous> | 146-174 | `v(v,v)=>{v(v){v(v.v==='v'){v(v.v){v(v&&v.v('v,v,v'...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 65-97 | `v():v<v>=>{v(v){v('v')v}v('v')v=v.v({v:'v',v:v,})v...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 247-279 | `v(v:v,v:v):v<v>=>{v('v',{v})v={v,v:v,v:'1.0',v:'v'...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 281-307 | `v(v:v,v:v,v:v):v<v>=>{v('v',{v,v:v.v,})v('v')v=v.v...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 309-360 | `v(v:v,v:v,v:v,v:v,v:v,v:v,):v<v>=>{v('v',{v,v,v,v,...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 456-500 | `()=>{v:v|v=v=v.v<v>('v[v*="v"][v*="v"]')v(v.v(v)){...` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 1-24 | `(v:'v'|'v'):v=>{v(v===0&&v&&v==='v'){v.v()}v(v>v.v...` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 61-79 | `(v)=>{v=v.v('v')v.v.v('v')v=v.v('v')v.v.v('v-v')v....` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 181-211 | `(v:v)=>{v:v|v=v=v.v(v.v)v(v=4;v<v.v;v++){v=v[v-4]v...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 8-40 | `(v:v):v=>{v=v(/\((.*)\)(.*)%/).v(v.v)v(v){v[,v,v]=...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 66-84 | `(v:v,v:v):v=>{v=v.v('v')v.v='v'v.v=v.v.v('v','v-v-...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 162-180 | `():v=>{v=v.v(v.v.v('v')).v((v)=>v.v!==v)v(v){v=v.v...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 39-77 | `()=>{v=v.v(v)?v.v('v'):v.v('v,v')v.v((v)=>{v=v.v.v...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 46-76 | `(v)=>{v=v.v.v()v(v.v(v)){v=v(v).v()v(v(v)||(v.v('v...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 79-96 | `()=>{v=v.v.v.v('\v')v(v=0;v<v.v;v++){v=v[v]v(v.v('...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 98-163 | `()=>{v=()=>{v=v.v('v')v(v&&v.v.v()!==''){v=v.v.v()...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 100-159 | `()=>{v=v.v('v')v(v&&v.v.v()!==''){v=v.v.v()v=v.v('...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 110-150 | `(v)=>{v(v.v(v)){v{v=v(v)v=v.v()v(v(v)){v=v.v(v,`<v...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 3-33 | `(v:v,v:v)=>{v=/[?&]v=(\v+)/v=v(v).v(v.v)v(v){v=v.v...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 35-72 | `():v<v|v>=>v((v,v)=>{v=v.v.v('v',1)v.v=()=>{v=`v:$...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 36-72 | `(v,v)=>{v=v.v.v('v',1)v.v=()=>{v=`v:${v?.v?.v??'v'...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 161-181 | `(v:v,v:v):v=>{v=v.v<v>("v[v*='v.v']")v(v){v(v,v)}v...` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 62-112 | `v(v:v):v<v>=>{v=v.v(!v.v('v')||!v.v('v.v')){v}v=v(...` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 115-140 | `(v:v):v=>{v.v.v='0.5'v.v.v='v-v'v.v.v='v-v'v.v.v='...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 398-443 | `(v:v,v:v,v:v,v:v,v:v)=>{v=v.v('v')v.v=`${v}-v`v=v....` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 448-499 | `(v=v)=>{v(!v&&v.v(`${v}-v`)){v('v')v}v(!v()){v('v,...` |

**Sample Normalized Code:**

```typescript
(v,v)=>{v(v){v(v.v.v>0&&v.v[0].v===v.v&&v.v[0].v==='v'){v=v.v[0]v(v.v.v('v:v.v({v:'v',v:v.v,v(v){v=v.v.v('v')v=v.v.v('[',v)v=v.v.v(']',v)v=v.v.v(v,v+1)v=v.v(v)v[]v.v(...v)v('v',v)},})v.v()v}}}}
```

**Original Code Sample (first function):**

```typescript
(mutationList, mutationObserver) => {
  for (const mutation of mutationList) {
    if (
      mutation.addedNodes.length > 0 &&
      mutation.addedNodes[0].nodeType === Node.ELEMENT_NODE &&
      mutation.addedNodes[0].nodeName === 'SCRIPT'
    ) {
      const element = mutation.addedNodes[0] as HTMLScriptElement
      if (element.src.startsWith('https://www.nytimes.com/games-assets/v2/wordle.')) {
        // Get the script
        GM.xmlHttpRequest({
          method: 'GET',
          url: element.src,
          onload(response) {
            // find a known valid word
            const sonic = response.responseText.indexOf('sonic')
            // find the beginning of array
            const begArray = response.responseText.lastIndexOf('[', sonic)
            // find the end of array
            const endArray = response.responseText.indexOf(']', sonic)
            // Get the word list from script
            const wordListStr = response.responseText.substring(begArray, endArray + 1)
            // Convert to an array object
            const tempArray = JSON.parse(wordListStr) as string[]
            fullWordList.push(...tempArray)
            setItem('wordList', fullWordList)
          },
        })
        mutationObserver.disconnect()
        break
      }
    }
  }
}
```

### Group 3 (42 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 82-93 | `():v=>{v=v.v('v')v.v.v('v')v.v='v'v=v.v('v')v.v='v...` |
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 174-188 | `(v:v):v|v=>{v=v.v(v){v[v,v,v]=v.v(',')v(v&&v!=='v'...` |
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 190-203 | `()=>{v:v[]=[]v=v.v<v>("v[v^='v-v']")v(v){v=v.v<v>(...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 69-80 | `()=>{v=v.v('v')v.v.v('v')v.v='v'v=v.v('v')v.v='v'v...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 82-96 | `(v:v,v:v[],v:v)=>{v=v.v('v')v.v=v.v(v)v=v.v('v')v(...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 182-204 | `()=>{v.v('v',(v)=>{v(v.v){v}v(v.v==='?'){v.v()v:v[...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 185-201 | `(v)=>{v(v.v){v}v(v.v==='?'){v.v()v:v[][]=[]v(v=1;v...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 213-229 | `(v:v):v|v=>{v=v.v(v){v=v(v).v(v)v(v&&v.v>3){v=v[1]...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 237-256 | `(v:v)=>{v:v[]=[]v=v.v<v>(`v[v="v"][v-v="v${v}"]`)v...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 96-107 | `()=>{v=v.v('v')v.v.v('v')v.v='v'v=v.v('v')v.v='v'v...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 109-123 | `(v:v,v:v[],v:v)=>{v=v.v('v')v.v=v.v(v)v=v.v('v')v(...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 238-259 | `(v:v)=>{v:v[]=[]v=v.v(`v-${v}`)v(v){v=v.v<v>("v[v~...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 261-283 | `()=>{v.v('v',(v)=>{v(v.v){v}v(v.v==='?'){v.v()v=[]...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 264-280 | `(v)=>{v(v.v){v}v(v.v==='?'){v.v()v=[]v(v=1;v<9;v++...` |
| src/plugins/microcenter-sort-by-stock/userscript.ts | <anonymous> | 29-42 | `()=>{v=v.v<v>('v.v')v(v){v.v='v'}v=v.v<v>('v.v')v=...` |
| src/plugins/microcenter-sort-by-stock/userscript.ts | <anonymous> | 44-60 | `(v:v,v:v)=>{v=0v=0v=v.v<v>('v.v')?.v(v){v=v.v('v',...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 150-160 | `(v:v,v:'v'|'v'|'v'='v')=>{v=v.v('v')v=v[v]||'v-v--...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 215-227 | `v(v:v):v<v>=>{v(`v${v}`)v=v.v({v,v:'v',v:'v',}).v(...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 229-245 | `v(v:v):v<v|v>=>{v(`v:${v}`)v=v.v({v:'v',v}).v((v)=...` |
| src/plugins/facebook-hide-marketplace-deals/userscript.ts | <anonymous> | 18-36 | `(v)=>{v(v){v(v.v==='v'&&v.v.v){v(v.v){v(v)}}v(v.v=...` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 69-78 | `(v)=>{v=v.v('v')v=v.v('v')v.v.v('v')v.v('v',v.v)v=...` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 236-255 | `(v)=>{v(v.v==='v'){v('v')}v(v.v==='v'){v('v')}v(v....` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 51-64 | `(v:v,v:v):v=>{v(v==='v'){v.v('v',v.v?'v':'v')v()}v...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 122-133 | `():v=>{v=v.v('v')v.v.v('v-v')v=v.v('v')v.v.v('v-v'...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 135-141 | `():v=>{v=v.v('v')!=='v'v=v.v(v.v('v')??'10',10)v=v...` |
| src/plugins/breeze-sidebar-autosize/userscript.ts | <anonymous> | 1-8 | `():v=>{v=v.v('v')[0]v=v.v('v')v.v('v','v/v')v.v='@...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 15-37 | `()=>{v=v.v('.v')v.v((v)=>{v=v.v.v()v(v.v('v')){v=v...` |
| src/plugins/base64-auto-decoder/userscript.ts | <anonymous> | 17-36 | `(v)=>{v=v.v.v()v(v.v('v')){v=v(v)v=v(v)v=v.v(v).v=...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 11-31 | `()=>{v=v.v=v.v('v','v').v('v')v(v){v.v({v,v:v.v,v:...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 53-71 | `()=>{v:v=v.v=v.v('v',{v:'v',})v.v('v','v',{v:v})v....` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 183-209 | `(v:v):v=>{v={v:v,v:v}v:v=(v)=>{v(v){v(v.v==='v'){v...` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 19-40 | `v(v:v):v<v|v>=>{v{v=v.v(v)v=v.v(v)v(!v){v}v:v=v.v(...` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 43-59 | `v(v:v,v:v):v<v>=>{v{v=v.v(v)v:v={v,v:v,v:v.v(),}v=...` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 143-157 | `v():v<v>=>{v=v.v<v>('v[v]')v.v(`v${v.v}v`)v=5v(v=0...` |
| src/plugins/amazon-hide-sponsored/userscript.ts | <anonymous> | 1-24 | `()=>{v=v.v("v,v,v.v,v,)v(v=0;v<v.v;v++){v=v.v(v)v(...` |
| src/plugins/amazon-goodreads-meta/userscript.ts | <anonymous> | 13-34 | `()=>{v:v[]=[]v=v.v<v>('v-v-v-v')v(v.v(v)){v=v.v.v(...` |
| src/plugins/amazon-goodreads-meta/userscript.ts | <anonymous> | 99-119 | `v(v:v[])=>{v(v){v{v=v(v)v=v.v=v.v(v.v)v(v&&v.v>1){...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 342-365 | `(v:v,v:v,v:v,v:v)=>{v=v('v',`v:`v:`v${v}`,'v',!v,)...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 367-396 | `(v:v,v:v,v:v,v:v,v:v,)=>{v=v('v',`v:`v:`v${v}`,'v'...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 504-540 | `(v=v)=>{v(v)v(!v.v(`${v}-v`)&&v()){v('v')v=0v=10v=...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 542-564 | `()=>{v=v.v=v(()=>{v(v.v!==v){v=v.v('v,v')v(v(){v(v...` |
| src/plugins/amazon-add-to-goodreads/userscript.ts | <anonymous> | 15-29 | `(v:v,v:v):v=>{v=v.v('v')v.v='v'v.v=['<v="v">','<v=...` |

**Sample Normalized Code:**

```typescript
():v=>{v=v.v('v')v.v.v('v')v.v='v'v=v.v('v')v.v='v'v=v.v('v')v.v='v'v.v(v)v.v(v)v}
```

**Original Code Sample (first function):**

```typescript
(): HTMLDialogElement => {
  const wordlist = document.createElement('dialog')
  wordlist.classList.add('dialog')
  wordlist.id = 'dialog'
  const header = document.createElement('h2')
  header.textContent = 'Word List'
  const list = document.createElement('ul')
  list.id = 'wordList'
  wordlist.appendChild(header)
  wordlist.appendChild(list)
  return wordlist
}
```

### Group 4 (6 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/wordle-mild-cheat/userscript.ts | <anonymous> | 95-162 | `(v:v[]):v=>{v=v.v('v')v(!v){v=v.v('v')[0]v=v.v('v'...` |
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 98-173 | `(...v:v[][])=>{v=v.v('v')v(!v){v=v.v('v')[0]v=v.v(...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 125-200 | `(...v:v[][])=>{v=v.v('v')v(!v){v=v.v('v')[0]v=v.v(...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 362-454 | `v()=>{v{v('v...','v')v('v')v('v')v=v()v(!v){v('v',...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 74-159 | `(v:v,v:v):v=>{v=v.v(v){v(v!=='v'&&v.v('\v')===-1&&...` |
| src/plugins/amazon-goodreads-meta/userscript.ts | <anonymous> | 44-97 | `(v:v,v:v)=>{v=v.v('v')v.v.v='6v'v.v.v='5v'v.v.v='#...` |

**Sample Normalized Code:**

```typescript
(v:v[]):v=>{v=v.v('v')v(!v){v=v.v('v')[0]v=v.v('v')v.v(v)v.v('v','v/v')v.v?.v(`.v{v:v;v:2v;}`)v.v?.v(`.v{v-v:v;v:4v;v:v;v:0v;}`)v.v?.v(`.v{v-v:0.6875v;v-v:1.5;v-v:0.08v;v-v:"v",-v-v,v,"v",v,"v",v,v-v,"v","v","v";v-v:700;v:v;v-v:v;v-v:5v;v:0v;v:100%;v-v:v-v;v:v-v(0.4,0,0.2,1)0v,v-v-v(0.4,0,0.2,1)0v;v-v:v;v:v(111,126,140);v-v:8v;v-v:v;}`)v.v?.v(`.v{v:50%;v:50%;v:v(-50%,-50%);v:300v;v:20v;v-v:#v;v:1v#v;v-v:02v(0,0,0,0.2);v-v:v,v-v;v:#333;v:0v;}`)v=v()v.v.v(v)v=v.v('v')}v(v){v.v=''v(v){v=v.v('v')v.v=v?.v(v)}}v.v<v>('v#v')?.v()}
```

**Original Code Sample (first function):**

```typescript
(curWords: string[]): void => {
  let wordList = document.getElementById('wordList')
  if (!wordList) {
    // load new styles
    const head = document.getElementsByTagName('head')[0]
    const style = document.createElement('style')
    head.appendChild(style)
    style.setAttribute('type', 'text/css')
    style.sheet?.insertRule(`.dialog li {
        display: block;
        padding: 2px 0px;
      }`)
    style.sheet?.insertRule(`.dialog ul {
        list-style: none;
        margin: 4px 0px;
        position: relative;
        padding: 0px;
      }`)
    style.sheet?.insertRule(`.dialog h2 {
        font-size: 0.6875rem;
        line-height: 1.5;
        letter-spacing: 0.08rem;
        font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 700;
        display: flex;
        align-items: center;
        border-radius: 5px;
        outline: 0px;
        width: 100%;
        justify-content: flex-start;
        transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        text-decoration: none;
        color: rgb(111, 126, 140);
        margin-top: 8px;
        text-transform: uppercase;
      }`)
    style.sheet?.insertRule(`.dialog {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        padding: 20px;
        background-color: #f2f2f2;
        border: 1px solid #ccc;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        font-family: Arial, sans-serif;
        color: #333;
        margin: 0 auto;
      }`)

    // create wordlist div
    const helpDiv = createWordlistDialog()

    // attach to body
    document.body.appendChild(helpDiv)

    wordList = document.getElementById('wordList')
  }
  if (wordList) {
    wordList.innerHTML = ''
    for (const word of curWords) {
      const listItem = document.createElement('li')
      listItem.textContent = word
      wordList?.appendChild(listItem)
    }
  }
  document.querySelector<HTMLDialogElement>('dialog#dialog')?.showModal()
}
```

### Group 5 (4 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/wirecutter-anti-modal/userscript.ts | <anonymous> | 36-45 | `(v,v)=>{v(v){v(v)v(v)v(v&&v){v.v()}}}` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 34-40 | `():v=>{v=v[v].v('v-v')v(v){v.v(v,'v')}}` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 100-106 | `(v)=>{v=v.v|v(v){v.v(v,v.v)v()}}` |
| src/plugins/amazon-add-to-goodreads/userscript.ts | <anonymous> | 31-37 | `():v=>{v=v()v=v()v(v&&v){v(v,v)}}` |

**Sample Normalized Code:**

```typescript
(v,v)=>{v(v){v(v)v(v)v(v&&v){v.v()}}}
```

**Original Code Sample (first function):**

```typescript
(mutationsList, observer) => {
    for (const mutation of mutationsList) {
      removePaywallModal(mutation)
      removeScrollLock(mutation)
      // if we've fixed the issues, stop observing
      if (modalRemoved && overflowFixed) {
        observer.disconnect()
      }
    }
  }
```

### Group 6 (2 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/shawnee-mission-post-paywall-remover/userscript.ts | <anonymous> | 39-45 | `()=>{v=v(v)v.v(v,v)}` |
| src/plugins/ancestry-premium-content-blocker/userscript.ts | <anonymous> | 176-182 | `(v)=>{v(v){v(v.v){v(v)}}}` |

**Sample Normalized Code:**

```typescript
()=>{v=v(v)v.v(v,v)}
```

**Original Code Sample (first function):**

```typescript
() => {
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback)

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config)
}
```

### Group 7 (10 functions)

| File | Function | Line | Normalized Preview |
|------|----------|------|-------------------|
| src/plugins/quordle-mild-cheat/userscript.ts | <anonymous> | 268-307 | `(v:v[])=>{v:v[]=[...v,...v]v(v)v(v){v(v.v==='v'){v...` |
| src/plugins/octordle-mild-cheat/userscript.ts | <anonymous> | 289-332 | `(v:v[])=>{v=[...v,...v]v(v)v(v){v(v.v===v.v){v=v.v...` |
| src/plugins/lichess-opening-explorer/userscript.ts | <anonymous> | 140-192 | `v()=>{v.v('v.')v=v.v={v:v,v:v}v:v=v(v,v)=>{v(v){v(...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 109-148 | `()=>{v='v-v-v'v(v.v(v)){v}v=`.v-v{v:v;v:20v;v:20v;...` |
| src/plugins/gutenberg-send-to-kindle/userscript.ts | <anonymous> | 162-213 | `():v|v=>{v=v.v(v.v<v>('v[v*=".v."]'))v:v|v=v='v(v-...` |
| src/plugins/equip-bid-keyboard-navigation/userscript.ts | <anonymous> | 50-81 | `():v=>{v=v.v('v')v.v.v('v')v=v.v('v')v.v.v('v')v.v...` |
| src/plugins/ebay-seller-hider/userscript.ts | <anonymous> | 86-120 | `(v:v,v:v,v?:v):v=>{v=v.v('v')v.v.v('v-v--v')v=v.v(...` |
| src/plugins/ancestry-remove-paid-hints/userscript.ts | <anonymous> | 89-155 | `()=>{v=v.v=v(!v){v.v({v:'v',v:v.v,v(v){v(v.v===v.v...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 94-150 | `():v|v=>{v=v.v('v')v|v(v?.v){v('v#v')v.v}v=v.v('v'...` |
| src/plugins/amazon-camelcamelcamel-keepa-price-charts/userscript.ts | <anonymous> | 284-340 | `(v:v,v:v,v:v,v:v,v:v,v=v,):v=>{v=v.v('v')v.v='v-v'...` |

**Sample Normalized Code:**

```typescript
(v:v[])=>{v:v[]=[...v,...v]v(v)v(v){v(v.v==='v'){v=v.v((v)=>v.v(v.v-1).v()===v.v.v(),)}v(v.v==='v'){v=v.v((v)=>v.v(v.v-1).v()!==v.v.v()&&v.v(v.v.v())!==-1,)}v(v.v==='v'&&!v.v(({v,v})=>(v==='v'||v==='v')&&v===v.v)){v=v.v((v)=>v.v(v.v.v())===-1)}v(v.v==='v'&&v.v(({v,v})=>(v==='v'||v==='v')&&v===v.v)){v=v.v((v)=>v.v(v.v.v())===v.v(v.v.v()),)}}v}
```

**Original Code Sample (first function):**

```typescript
(boardState: ProcessedCell[]) => {
  let tempWordList: string[] = [...wordBankWords, ...allowedWords]

  // sort boardState so all correct answers are handled first, then diff, then none
  sortProcessedCells(boardState)

  for (const item of boardState) {
    if (item.status === 'correct') {
      // process all the correct answers first to shrink word list
      tempWordList = tempWordList.filter(
        (word) => word.charAt(item.position - 1).toUpperCase() === item.letter.toUpperCase(),
      )
    } else if (item.status === 'diff') {
      // now eliminate words where 'diff' items appear in that spot
      // and where 'diff' item doesn't appear at all
      tempWordList = tempWordList.filter(
        (word) =>
          word.charAt(item.position - 1).toUpperCase() !== item.letter.toUpperCase() &&
          word.indexOf(item.letter.toUpperCase()) !== -1,
      )
    } else if (
      item.status === 'none' &&
      !boardState.some(({ letter, status }) => (status === 'correct' || status === 'diff') && letter === item.letter)
    ) {
      // need to be careful here, only remove 'none' if it wasn't previously 'correct' or 'diff' (since it could be a second occurance)
      tempWordList = tempWordList.filter((word) => word.indexOf(item.letter.toUpperCase()) === -1)
    } else if (
      item.status === 'none' &&
      boardState.some(({ letter, status }) => (status === 'correct' || status === 'diff') && letter === item.letter)
    ) {
      // edge case; remove words with duplicate letters if status is none but other status of diff or correct exists
      // this will not handle words with 3 of the same letter correctly
      tempWordList = tempWordList.filter(
        (word) => word.indexOf(item.letter.toUpperCase()) === word.lastIndexOf(item.letter.toUpperCase()),
      )
    }
  }

  return tempWordList
}
```

