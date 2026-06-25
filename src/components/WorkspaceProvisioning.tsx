import { useState, useEffect, useRef } from 'react'
import {
  Button,
  CodeBlock,
  CodeBlockCode,
  Content,
  PageSection,
  ProgressStep,
  ProgressStepper,
  Title,
} from '@patternfly/react-core'
import { CheckCircleIcon, TimesIcon } from '@patternfly/react-icons'
import type { WorkspaceInfo } from './workspaceTypes'

interface WorkspaceProvisioningProps {
  workspace: WorkspaceInfo
  onComplete: () => void
  onCancel: () => void
}

const STEPS = [
  {
    title: 'Preparing workspace',
    description: 'Allocating resources and pulling container image',
    duration: 1500,
    logs: [
      'Allocating workspace resources...',
      'Pulling image quay.io/devspaces/udi:latest...',
      'Image layers downloaded (5/5)',
      'Container started successfully',
    ],
  },
  {
    title: 'Cloning repository',
    description: 'Cloning source code and checking out branch',
    duration: 2000,
    logs: [
      'Initializing git...',
      'Cloning into workspace directory...',
      'Receiving objects: 100% (142/142)',
      'Repository cloned successfully (142 files)',
    ],
  },
  {
    title: 'Installing dependencies',
    description: 'Resolving devfile and installing project dependencies',
    duration: 2000,
    logs: [
      'Parsing devfile.yaml...',
      'Resolving project dependencies...',
      'Installing packages...',
      'Dependencies installed successfully',
    ],
  },
  {
    title: 'Configuring IDE',
    description: 'Setting up editor and extensions',
    duration: 1500,
    logs: [
      'Configuring editor settings...',
      'Installing workspace extensions...',
      'Editor configuration complete',
    ],
  },
  {
    title: 'Establishing connection',
    description: 'Opening direct connection to workspace',
    duration: 1000,
    logs: [
      'Initializing secure channel...',
      'Opening direct connection...',
      'Connection established',
    ],
  },
]

function getTimestamp(offset: number): string {
  const d = new Date()
  d.setSeconds(d.getSeconds() + offset)
  return d.toLocaleTimeString('en-US', { hour12: false })
}

export function WorkspaceProvisioning({ workspace, onComplete, onCancel }: WorkspaceProvisioningProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [logLines, setLogLines] = useState<string[]>([])
  const logRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const t = setTimeout(onComplete, 600)
      return () => clearTimeout(t)
    }
    const step = STEPS[currentStep]

    step.logs.forEach((line, i) => {
      const t = setTimeout(() => {
        setLogLines((prev) => [...prev, `[${getTimestamp(0)}] ${line}`])
      }, (step.duration / step.logs.length) * i)
      timerRef.current = t
    })

    const advance = setTimeout(() => {
      setCurrentStep((s) => s + 1)
    }, step.duration)

    return () => {
      clearTimeout(advance)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentStep, onComplete])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logLines])

  const repoDisplay = workspace.repoUrl
    ? workspace.repoUrl.replace(/^https?:\/\//, '').replace(/\.git$/, '')
    : workspace.templateName || 'template'

  return (
    <PageSection>
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title headingLevel="h2" size="xl">
            Creating Workspace
          </Title>
          <Content component="p" style={{ marginTop: 8, opacity: 0.7 }}>
            <strong>{workspace.name}</strong> &middot; {repoDisplay}
          </Content>
        </div>

        <ProgressStepper isVertical>
          {STEPS.map((step, i) => {
            let variant: 'success' | 'info' | 'pending' = 'pending'
            if (i < currentStep) variant = 'success'
            else if (i === currentStep) variant = 'info'

            return (
              <ProgressStep
                key={step.title}
                id={`step-${i}`}
                titleId={`step-title-${i}`}
                variant={variant}
                description={
                  i === currentStep
                    ? step.description
                    : i < currentStep
                      ? 'Complete'
                      : step.description
                }
                icon={i < currentStep ? <CheckCircleIcon /> : undefined}
                isCurrent={i === currentStep}
              >
                {step.title}
              </ProgressStep>
            )
          })}
        </ProgressStepper>

        <div style={{ marginTop: 24 }}>
          <Content component="small" style={{ opacity: 0.6, marginBottom: 4, display: 'block' }}>
            Build log
          </Content>
          <CodeBlock>
            <CodeBlockCode
              ref={logRef as React.Ref<HTMLElement>}
              style={{
                maxHeight: 160,
                overflowY: 'auto',
                fontSize: 12,
                lineHeight: '1.6',
              }}
            >
              {logLines.join('\n') || 'Starting...'}
            </CodeBlockCode>
          </CodeBlock>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button variant="link" icon={<TimesIcon />} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </PageSection>
  )
}
