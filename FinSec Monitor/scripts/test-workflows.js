// Native fetch is available in Node 18+

async function testWorkflowLifecycle() {
    const baseUrl = 'http://localhost:3000/api/workflows';
    
    console.log('1. Creating Workflow...');
    const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Test Workflow " + Date.now(),
            description: "Automated test workflow",
            definition: { steps: ["step1", "step2"] },
            isActive: true
        })
    });
    
    if (!createRes.ok) {
        console.error('Failed to create workflow:', await createRes.text());
        return;
    }
    const workflow = await createRes.json();
    console.log('✅ Created:', workflow.id);

    console.log('2. Fetching Workflows...');
    const listRes = await fetch(baseUrl);
    const workflows = await listRes.json();
    const found = workflows.find(w => w.id === workflow.id);
    if (found) console.log('✅ Found workflow in list');
    else console.error('❌ Workflow not found in list');

    console.log('3. Updating Workflow...');
    const updateRes = await fetch(baseUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: workflow.id,
            name: workflow.name + " (Updated)",
            isActive: false
        })
    });
    const updated = await updateRes.json();
    console.log('✅ Updated status:', updated.isActive === false ? 'Inactive' : 'Active');

    console.log('4. Deleting Workflow...');
    const deleteRes = await fetch(`${baseUrl}?id=${workflow.id}`, { method: 'DELETE' });
    if (deleteRes.ok) console.log('✅ Deleted successfully');
    else console.error('❌ Delete failed');
}

testWorkflowLifecycle().catch(console.error);
