import { Payload } from 'payload'
import PageLockModalClient from './client'

async function PageLockModal({ payload, id }: { payload: Payload, id: string }) {
    const page = await payload.findByID({
        collection: 'pages',
        id: id,
    });

    return <PageLockModalClient
        hidden={!page.migrationTaskId}>
        <p>The page is currently locked</p>
        <div>
            <button>Go to Pages</button>
            <button>Cancel Migration</button>
        </div>
    </PageLockModalClient>;
}

export default PageLockModal;
