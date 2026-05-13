import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        url = 'http://localhost:9001/api/issues/search'
        auth = ('squ_d2f6273d3535ff30bf0b80e6ef0f02a498f135c7', '')
        project = 'vs-drag-drop-rbe'
        
        # Test 1: all issues
        r = await client.get(url, params={'componentKeys': project}, auth=auth)
        if r.status_code == 200:
            print('Total open issues:', r.json().get('total'))
        
        # Test 2: what does our resolved query return
        params2 = {
            'componentKeys': project,
            'resolved': 'true',
            'resolutions': 'FIXED,REMOVED',
            'ps': 10
        }
        r2 = await client.get(url, params=params2, auth=auth)
        if r2.status_code == 200:
            print('Resolved total (all time):', r2.json().get('total'))
            if r2.json().get('total') > 0:
                print('Sample resolved issue updateDate:', r2.json()['issues'][0].get('updateDate'))
        else:
            print('Resolved query failed:', r2.status_code, r2.text)
            
        # Try finding statuses=CLOSED
        params2_alt = {
            'componentKeys': project,
            'statuses': 'CLOSED',
            'ps': 10
        }
        r2_alt = await client.get(url, params=params2_alt, auth=auth)
        if r2_alt.status_code == 200:
            print('Closed total (all time):', r2_alt.json().get('total'))
        else:
            print('Closed query failed:', r2_alt.status_code, r2_alt.text)
        
        # Test 3: analyses
        r3 = await client.get('http://localhost:9001/api/project_analyses/search', params={'project': project}, auth=auth)
        if r3.status_code == 200:
            analyses = r3.json().get('analyses', [])
            print('Scan dates:')
            for a in analyses[:3]:
                print(f" - {a.get('date')}")

asyncio.run(main())
