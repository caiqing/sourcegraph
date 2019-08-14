import H from 'history'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RepositoryIcon } from '../../../../../shared/src/components/icons'
import { displayRepoName } from '../../../../../shared/src/components/RepoFileLink'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { PlatformContextProps } from '../../../../../shared/src/platform/context'
import { parseRepoURI } from '../../../../../shared/src/util/url'
import { FileDiffNode } from '../../../repo/compare/FileDiffNode'
import { ThemeProps } from '../../../theme'
import { Comment } from '../../comments/Comment'
import { ThreadStateBadge } from '../common/threadState/ThreadStateBadge'
import { THREAD_COMMENT_CREATED_VERB, THREAD_COMMENT_EMPTY_BODY } from '../detail/ThreadOverview'

interface Props extends ExtensionsControllerProps, PlatformContextProps, ThemeProps {
    thread: GQL.IThreadPreview

    className?: string
    location: H.Location
    history: H.History
}

export const ThreadPreview: React.FunctionComponent<Props> = ({ thread, className = '', ...props }) => {
    const now = useMemo(() => new Date().toISOString(), [])
    const c = thread.repositoryComparison
    return (
        <div className={`thread-preview ${className}`}>
            <span className="badge badge-info font-weight-bold mb-3">Previewing individual thread in campaign</span>
            <h2 className="mb-3">{thread.title}</h2>
            <div className="d-flex align-items-center mb-3">
                <ThreadStateBadge thread={{ ...thread, state: GQL.ThreadState.OPEN }} className="mr-3" />
                <Link to={thread.repository.url}>
                    <RepositoryIcon className="icon-inline" /> {displayRepoName(thread.repository.name)}
                </Link>
            </div>
            <Comment
                {...props}
                comment={{
                    ...thread,
                    __typename: 'Thread',
                    id: '',
                    viewerCanUpdate: false,
                    createdAt: now,
                    updatedAt: now,
                }}
                onCommentUpdate={null}
                createdVerb={THREAD_COMMENT_CREATED_VERB}
                emptyBody={THREAD_COMMENT_EMPTY_BODY}
                className="mb-3"
            />
            {c &&
                c.fileDiffs.nodes.map((d, j) => (
                    <FileDiffNode
                        key={d.internalID}
                        {...props}
                        // TODO!(sqs): hack dont show full uri in diff header
                        node={{
                            ...d,
                            oldPath: parseRepoURI(d.oldPath!).filePath!,
                            newPath: parseRepoURI(d.newPath!).filePath!,
                        }}
                        base={{
                            repoName: c.baseRepository.name,
                            repoID: c.baseRepository.id,
                            rev: c.range.baseRevSpec.expr,
                            commitID: c.range.baseRevSpec.object!.oid, // TODO!(sqs)
                        }}
                        head={{
                            repoName: c.headRepository.name,
                            repoID: c.headRepository.id,
                            rev: c.range.headRevSpec.expr,
                            commitID: c.range.headRevSpec.object!.oid, // TODO!(sqs)
                        }}
                        lineNumbers={false}
                        className="mb-0"
                    />
                ))}
        </div>
    )
}